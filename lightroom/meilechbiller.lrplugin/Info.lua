--[[----------------------------------------------------------------------------
Info.lua
Meilech Biller Galleries — Lightroom Classic publish service

Publishes proofs and finals to meilechbiller.com client galleries and pulls
client notes and favorites back into Lightroom's Comments panel.
------------------------------------------------------------------------------]]

return {
	LrSdkVersion = 6.0,
	LrSdkMinimumVersion = 6.0,

	LrToolkitIdentifier = 'com.meilechbiller.lightroom.galleries',
	LrPluginName = 'Meilech Biller Galleries',
	LrPluginInfoUrl = 'https://meilechbiller.com/admin/integrations',

	LrExportServiceProvider = {
		title = 'Meilech Biller Galleries',
		file = 'MBExportServiceProvider.lua',
	},

	VERSION = { major = 1, minor = 0, revision = 0, build = 1 },
}
