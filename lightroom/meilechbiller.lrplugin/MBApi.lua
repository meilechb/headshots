--[[----------------------------------------------------------------------------
MBApi.lua
HTTP client for the meilechbiller.com Lightroom API (/api/lr/*).
All calls raise a Lua error with a readable message on failure.
------------------------------------------------------------------------------]]

local LrFileUtils = import 'LrFileUtils'
local LrHttp = import 'LrHttp'

local JSON = require 'JSON'

MBApi = {}

local function baseUrl( settings )
	local url = ( settings.siteUrl or '' ):gsub( '%s+', '' ):gsub( '/+$', '' )
	if url == '' then error( 'Enter the site URL in the publish service settings.' ) end
	if not url:match( '^https?://' ) then url = 'https://' .. url end
	return url
end

local function headers( settings, contentType )
	local token = ( settings.apiToken or '' ):gsub( '%s+', '' )
	if token == '' then error( 'Enter an API token in the publish service settings (Studio → Lightroom).' ) end
	local h = {
		{ field = 'Authorization', value = 'Bearer ' .. token },
		{ field = 'Accept', value = 'application/json' },
		{ field = 'User-Agent', value = 'MeilechBillerGalleries-Lightroom/1.0' },
	}
	if contentType then h[ #h + 1 ] = { field = 'Content-Type', value = contentType } end
	return h
end

local function parse( result, hdrs, what )
	local status = hdrs and hdrs.status
	if not status then
		local detail = hdrs and hdrs.error and hdrs.error.name or 'no response'
		error( string.format( 'Could not reach the site while %s (%s). Check the site URL and your connection.', what, tostring( detail ) ) )
	end
	local data
	if result and result ~= '' then
		local ok, decoded = pcall( JSON.decode, result )
		if ok then data = decoded end
	end
	if status >= 400 then
		local message = ( type( data ) == 'table' and data.error ) or ( 'HTTP ' .. tostring( status ) )
		if status == 401 then message = 'The API token was rejected. Create a new one in Studio → Lightroom.' end
		error( string.format( '%s failed: %s', what, message ) )
	end
	return data or {}
end

function MBApi.request( settings, method, path, body, what )
	local url = baseUrl( settings ) .. '/api/lr' .. path
	local result, hdrs
	if method == 'GET' then
		result, hdrs = LrHttp.get( url, headers( settings ), 30 )
	else
		local payload = body and JSON.encode( body ) or ''
		result, hdrs = LrHttp.post( url, payload, headers( settings, 'application/json' ), method, 60 )
	end
	return parse( result, hdrs, what or ( method .. ' ' .. path ) )
end

-- ---------------------------------------------------------------- endpoints

function MBApi.ping( settings )
	return MBApi.request( settings, 'GET', '/ping', nil, 'testing the connection' )
end

function MBApi.listClients( settings )
	return MBApi.request( settings, 'GET', '/clients', nil, 'loading clients' ).clients or {}
end

function MBApi.createClient( settings, name, email )
	return MBApi.request( settings, 'POST', '/clients', { name = name, email = email }, 'creating the client' ).client
end

function MBApi.createGallery( settings, clientId, title, kind )
	return MBApi.request( settings, 'POST', '/galleries',
		{ client_id = clientId, title = title, kind = kind }, 'creating the gallery' ).gallery
end

function MBApi.getGallery( settings, galleryId )
	return MBApi.request( settings, 'GET', '/galleries/' .. galleryId, nil, 'loading the gallery' )
end

function MBApi.updateGallery( settings, galleryId, fields )
	return MBApi.request( settings, 'PATCH', '/galleries/' .. galleryId, fields, 'updating the gallery' ).gallery
end

function MBApi.beginUpload( settings, galleryId, lrPhotoId, fileName, size )
	return MBApi.request( settings, 'POST', '/galleries/' .. galleryId .. '/photos/begin',
		{ lr_photo_id = lrPhotoId, filename = fileName, content_type = 'image/jpeg', size = size },
		'preparing the upload' )
end

--- PUTs the rendered file straight to storage using the presigned URL.
function MBApi.uploadFile( uploadUrl, filePath, contentType )
	local data = LrFileUtils.readFile( filePath )
	if not data then error( 'Could not read the exported file ' .. tostring( filePath ) ) end
	local result, hdrs = LrHttp.post( uploadUrl, data,
		{ { field = 'Content-Type', value = contentType or 'image/jpeg' } }, 'PUT', 600 )
	local status = hdrs and hdrs.status
	if not status then error( 'The upload did not reach the storage server.' ) end
	if status >= 400 then
		error( string.format( 'Storage rejected the upload (HTTP %d): %s', status, tostring( result ):sub( 1, 200 ) ) )
	end
	return true
end

function MBApi.completeUpload( settings, galleryId, begun, lrPhotoId, fileName )
	return MBApi.request( settings, 'POST', '/galleries/' .. galleryId .. '/photos/complete',
		{ pathname = begun.pathname, base = begun.base, lr_photo_id = lrPhotoId, filename = fileName },
		'finishing the upload' )
end

function MBApi.feedback( settings, photoIds )
	return MBApi.request( settings, 'POST', '/feedback', { photo_ids = photoIds }, 'loading client notes' )
end

function MBApi.deletePhoto( settings, photoId )
	return MBApi.request( settings, 'DELETE', '/photos/' .. photoId, nil, 'removing the photo' )
end

function MBApi.addComment( settings, photoId, text )
	return MBApi.request( settings, 'POST', '/photos/' .. photoId .. '/comments', { body = text }, 'posting your reply' )
end

return MBApi
