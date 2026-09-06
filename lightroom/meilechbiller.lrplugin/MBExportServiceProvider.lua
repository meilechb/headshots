--[[----------------------------------------------------------------------------
MBExportServiceProvider.lua
Export/publish service definition: connection settings and the upload loop.
------------------------------------------------------------------------------]]

local LrDialogs = import 'LrDialogs'
local LrFileUtils = import 'LrFileUtils'
local LrPathUtils = import 'LrPathUtils'
local LrTasks = import 'LrTasks'
local LrView = import 'LrView'

require 'MBApi'
require 'MBPublishSupport'

local bind = LrView.bind

local exportServiceProvider = {}

-- Publish only (no plain export), JPEG sRGB, let the user pick size/quality/watermark.
exportServiceProvider.supportsIncrementalPublish = 'only'
exportServiceProvider.hideSections = { 'exportLocation', 'video' }
exportServiceProvider.allowFileFormats = { 'JPEG' }
exportServiceProvider.allowColorSpaces = { 'sRGB' }
exportServiceProvider.hidePrintResolution = true
exportServiceProvider.canExportVideo = false

exportServiceProvider.exportPresetFields = {
	{ key = 'siteUrl', default = 'https://meilechbiller.com' },
	{ key = 'apiToken', default = '' },
	{ key = 'tagFavorites', default = true },
	{ key = 'favoriteKeyword', default = 'Client Favorite' },
}

function exportServiceProvider.startDialog( propertyTable )
	propertyTable.connectionStatus = 'Not tested yet'
end

function exportServiceProvider.sectionsForTopOfDialog( f, propertyTable )
	return {
		{
			title = 'Meilech Biller Galleries',
			synopsis = bind 'connectionStatus',

			f:row {
				spacing = f:label_spacing(),
				f:static_text { title = 'Site URL:', alignment = 'right', width = share 'mbLabel' },
				f:edit_field { value = bind 'siteUrl', fill_horizontal = 1, immediate = true },
			},
			f:row {
				spacing = f:label_spacing(),
				f:static_text { title = 'API token:', alignment = 'right', width = share 'mbLabel' },
				f:password_field { value = bind 'apiToken', fill_horizontal = 1, immediate = true },
				f:push_button {
					title = 'Test connection',
					action = function()
						propertyTable.connectionStatus = 'Testing…'
						LrTasks.startAsyncTask( function()
							local ok, res = pcall( MBApi.ping, propertyTable )
							if ok then
								propertyTable.connectionStatus = 'Connected to ' .. tostring( res.studio or res.site or 'the site' )
							else
								propertyTable.connectionStatus = 'Failed: ' .. tostring( res )
							end
						end )
					end,
				},
			},
			f:row {
				spacing = f:label_spacing(),
				f:static_text { title = '', width = share 'mbLabel' },
				f:static_text { title = bind 'connectionStatus', fill_horizontal = 1 },
			},
			f:row {
				spacing = f:label_spacing(),
				f:static_text { title = '', width = share 'mbLabel' },
				f:static_text {
					title = 'Create a token in the studio dashboard under Lightroom. Each published collection becomes one client gallery.',
					fill_horizontal = 1, height_in_lines = 2,
				},
			},
		},
		{
			title = 'Client favorites',
			synopsis = function( props )
				return props.tagFavorites and ( 'Tag with keyword “' .. tostring( props.favoriteKeyword ) .. '”' ) or 'Not tagged'
			end,
			f:row {
				f:checkbox { title = 'When a client marks a favorite, add this keyword to the photo:', value = bind 'tagFavorites' },
				f:edit_field { value = bind 'favoriteKeyword', width_in_chars = 18, enabled = bind 'tagFavorites' },
			},
			f:row {
				f:static_text {
					title = 'Favorites and notes refresh when you select a published photo (Library → Comments panel) or click the refresh arrows.',
					fill_horizontal = 1, height_in_lines = 2,
				},
			},
		},
	}
end

-- ------------------------------------------------------------ publishing

--- Resolves or creates the site gallery for this published collection.
local function ensureGallery( exportSettings, exportContext )
	local info = exportContext.publishedCollectionInfo
	if info.remoteId then
		return info.remoteId, info.remoteUrl, false
	end

	local settings = {}
	if info.publishedCollection then
		local summary = info.publishedCollection:getCollectionInfoSummary()
		settings = ( summary and summary.collectionSettings ) or {}
	end

	if info.isDefaultCollection or not info.publishedCollection then
		error( 'Create a Published Collection (right-click the service → Create Published Collection), choose the client, then publish.' )
	end

	local clientId = settings.clientId
	if not clientId or clientId == '' then
		local name = settings.newClientName and settings.newClientName:gsub( '^%s+', '' ):gsub( '%s+$', '' ) or ''
		local email = settings.newClientEmail and settings.newClientEmail:gsub( '%s+', '' ) or ''
		if name == '' or email == '' then
			error( 'Edit this collection (right-click → Edit Collection) and choose a client or enter a new client name and email.' )
		end
		local client = MBApi.createClient( exportSettings, name, email )
		clientId = client.id
	end

	local gallery = MBApi.createGallery( exportSettings, clientId, info.name, settings.kind or 'proof' )
	return gallery.id, gallery.url, true
end

function exportServiceProvider.processRenderedPhotos( functionContext, exportContext )
	local exportSession = exportContext.exportSession
	local exportSettings = assert( exportContext.propertyTable )
	local nPhotos = exportSession:countRenditions()

	local progressScope = exportContext:configureProgress {
		title = nPhotos > 1
			and string.format( 'Publishing %d photos to your gallery', nPhotos )
			or 'Publishing one photo to your gallery',
	}

	local galleryId, galleryUrl, created = ensureGallery( exportSettings, exportContext )

	local info = exportContext.publishedCollectionInfo
	local settings = {}
	if info.publishedCollection then
		local summary = info.publishedCollection:getCollectionInfoSummary()
		settings = ( summary and summary.collectionSettings ) or {}
	end

	local uploaded, failed = 0, 0

	for i, rendition in exportContext:renditions { stopIfCanceled = true } do
		progressScope:setPortionComplete( ( i - 1 ) / nPhotos )
		local photo = rendition.photo

		if not rendition.wasSkipped then
			local success, pathOrMessage = rendition:waitForRender()
			progressScope:setPortionComplete( ( i - 0.5 ) / nPhotos )
			if progressScope:isCanceled() then break end

			if success then
				local lrPhotoId = photo:getRawMetadata( 'uuid' )
				local fileName = photo:getFormattedMetadata( 'fileName' ) or LrPathUtils.leafName( pathOrMessage )
				-- Deliver as .jpg regardless of the source (raw) filename.
				fileName = LrPathUtils.removeExtension( fileName ) .. '.jpg'
				local size = LrFileUtils.fileAttributes( pathOrMessage ).fileSize

				local ok, err = pcall( function()
					local begun = MBApi.beginUpload( exportSettings, galleryId, lrPhotoId, fileName, size )
					MBApi.uploadFile( begun.upload_url, pathOrMessage, begun.content_type )
					local done = MBApi.completeUpload( exportSettings, galleryId, begun, lrPhotoId, fileName )
					rendition:recordPublishedPhotoId( done.photo.id )
					rendition:recordPublishedPhotoUrl( galleryUrl )
				end )

				LrFileUtils.delete( pathOrMessage )

				if ok then
					uploaded = uploaded + 1
				else
					failed = failed + 1
					rendition:uploadFailed( tostring( err ) )
				end
			else
				failed = failed + 1
				rendition:uploadFailed( tostring( pathOrMessage ) )
			end
		else
			rendition:recordPublishedPhotoId( rendition.publishedPhotoId )
		end
	end

	if created then
		exportSession:recordRemoteCollectionId( galleryId )
	end
	exportSession:recordRemoteCollectionUrl( galleryUrl )

	if uploaded > 0 and settings.publishToClient then
		pcall( MBApi.updateGallery, exportSettings, galleryId, { status = 'published' } )
	end

	progressScope:done()

	if created and uploaded > 0 then
		local ok, data = pcall( MBApi.getGallery, exportSettings, galleryId )
		if ok and data.gallery then
			local g = data.gallery
			LrDialogs.message(
				'Gallery created: ' .. tostring( g.title ),
				string.format( 'Link: %s\nAccess code: %s\nStatus: %s\n\nOpen Studio → Galleries to email the link and code to %s.',
					tostring( g.url ), tostring( g.access_code ), tostring( g.status ), tostring( g.client and g.client.name or 'the client' ) ),
				'info' )
		end
	elseif failed > 0 then
		LrDialogs.message( string.format( '%d photo(s) could not be published', failed ),
			'Check the site URL and API token in the publish service settings, then publish again.', 'warning' )
	end
end

-- Merge publish hooks (collections, comments, ratings, deletes).
for key, value in pairs( MBPublishSupport ) do
	exportServiceProvider[ key ] = value
end

return exportServiceProvider
