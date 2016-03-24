var track = require('ac-koa-hipchat-keenio').track;

var ack = require('ac-koa').require('hipchat');
var pkg = require('./package.json');
var app = ack(pkg);
var get1 = require('simple-get');

var yandex_token = 'trnsl.1.1.20160317T173735Z.2be744fb3540d280.25573e00053497a5547e1c8f01cce7376f48c9f9';
var url = 'https://translate.yandex.net/api/v1.5/tr.json/translate?key='+yandex_token;

var addon = app.addon()
  .hipchat()
  .allowGlobal(true)
  .allowRoom(true)
  .scopes('send_notification');

track(addon);

if (process.env.DEV_KEY) {
  addon.key(process.env.DEV_KEY);
}

addon.webhook('room_message', /^\/translate(?:\s+(:)?(.+?)\s*$)?/i, function *() {
    var global = !this.tenant.room;
    var match = this.match;
    var room = this.room;
    var command = match && match[1] === ':' && match[2];
    if (command) {
    	if (/\w{2}-\w{2}\s.*/i.test(command)) {
			var result = "";
	    		var langtext = match[2].split(' ');
			var urlcall = url+'&lang='+langtext[0]+'&text='+encodeURIComponent(langtext.slice(1).join(" "));
			var me = this;
			get1(urlcall, (err, res) => {
				if (err) {
					console.log(err);
					me.roomClient.sendNotification('An error occurred. Please contact your administrator for more information.');
				};
				res.setEncoding('utf8');
				res.on('data', (buffer) => {
					if(buffer){
						var resultObj = JSON.parse(buffer);
						result += resultObj.text;
					}
				});
 				res.on('end', () => {
 					if (result == 'undefined') {
 						me.roomClient.sendNotification('Use a valid language code. Please see https://tech.yandex.com/translate/doc/dg/concepts/langs-docpage/');	
 					} else {
						me.roomClient.sendNotification(result);
 					}
				});
			});			
		} else if (/langs/i.test(command)) {
  		yield this.roomClient.sendNotification(['<pre>',
			'Langs:',
				'Czech - cs',
				'Arabic - ar',
				'Armenian - hy',
				'Azerbaijan - az',
				'Belarusian - be',
				'Bulgarian - bg',
				'Vietnamese - vi',
				'Haitian (Creole) - ht',
				'Georgian - ka',
				'Yiddish - he',
				'Kazakh - kk',
				'Japanese - ja',
				'Ukrainian - uk',
				'Tatar - tt',
				'Thai - th',
				'Tajik - tg',
				'Serbian - sr',
				'Russian - ru',
				'Persian - fa',
				'Mongolian - mn',
				'Macedonian - mk',
				'Maltese - mt',
				'Korean - ko',
				'Chinese - zh',
				'Kyrgyz - ky',
				'Greek - el',
				'Estonian - et',
				'Swedish - sv',
				'Croatian - hr',
				'French - fr',
				'Finish - fi',
				'Uzbek - uz',
				'Turkish - tr',
				'Tagalog - tl',
				'Swahili - sw',
				'English - en',
				'Portuguese - pt',
				'Italian - it',
				'Slovenian - sl',
				'Slovakian - sk',
				'Romanian - ro',
				'Polish - pl',
				'Norwegian - no',
				'German - de',
				'Malay - ms',
				'Malagasy - mg',
				'Lithuanian - lt',
				'Latvian - lv',
				'Latin - la',
				'Catalan - ca',
				'Spanish - es',
				'Indonesian - id',
				'Irish - ga',
				'Icelandic - is',
				'Danish - da',
				'Galician - gl',
				'Dutch - nl',
				'Hungarian - hu',
				'Bosnian - bs',
				'Welsh - cy',
				'Afrikaans - af',
				'Basque - eu',
				'Albanian - sq',
				'</pre>'].join("\n"));
		} else {
			yield this.roomClient.sendNotification('Please follow the correct format for translation (i.e: /translate :en-fr house).');
		}	
  	}  else {
		yield this.roomClient.sendNotification('<b>Usage</b>: translates the text you insert from language l1 to language l2 (i.e: /translate :en-fr home)');
 		yield this.roomClient.sendNotification('For the list of support languages please run <i>/translate :langs </i> ');
	}
});

app.listen();
