var db = require.main.require('./src/database'); 
var validator = require('validator');

var plugin = {};

function getCustomCSS(uid, callback) {
	if (!uid) {
		return callback(null, '');
	}
	db.getObjectFields('user:' + uid + ':settings', ['customCSS'], function(err, customCSS) {
		if (err) {
			return callback(err);
		}

		callback(null, (customCSS || {}).customCSS || '');
	});
}

function setCustomCSS(uid, customCSS, callback) {
	if (!uid) {
		return callback(new Error('[[error:invalid-data]]'));
	}
	db.setObjectField('user:' + uid + ':settings', 'customCSS', String(customCSS || ''), function(err) {
		callback(err);
	});
}

plugin.addCustomSetting = function(data, callback) {
	getCustomCSS(data.uid, function(err, customCSS) {
		if (err) {
			return callback(err);
		}

		data.customSettings.push({
			'title': 'Custom CSS',
			'content': '<textarea data-property="customCSS" class="form-control" type="textarea">' + validator.escape(customCSS) + '</textarea><p class="help-block">Requires a refresh to take effect.</p>'
		});

		callback(null, data);
	});
};

plugin.saveUserSettings = function(data) {
	setCustomCSS(data.uid, data.settings.customCSS, function() { });
};

plugin.getUserSettings = function(data, callback) {
	data.settings.customCSS = data.settings.customCSS || '';
	callback(null, data);
};

plugin.renderHeader = function(data, callback) {
	if (!data.req.uid) {
		return callback(null, data);
	}

	getCustomCSS(data.req.uid, function(err, customCSS) {
		if (err) {
			return callback(err);
		}
		if (customCSS) {
			data.templateValues.useCustomCSS = true;
			data.templateValues.customCSS += customCSS;
		}
		callback(null, data);
	});
};

module.exports = plugin;
