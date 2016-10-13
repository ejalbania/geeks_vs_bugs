(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var has = ({}).hasOwnProperty;

  var aliases = {};

  var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  var unalias = function(alias, loaderPath) {
    var start = 0;
    if (loaderPath) {
      if (loaderPath.indexOf('components/' === 0)) {
        start = 'components/'.length;
      }
      if (loaderPath.indexOf('/', start) > 0) {
        loaderPath = loaderPath.substring(start, loaderPath.indexOf('/', start));
      }
    }
    var result = aliases[alias + '/index.js'] || aliases[loaderPath + '/deps/' + alias + '/index.js'];
    if (result) {
      return 'components/' + result.substring(0, result.length - '.js'.length);
    }
    return alias;
  };

  var expand = (function() {
    var reg = /^\.\.?(\/|$)/;
    return function(root, name) {
      var results = [], parts, part;
      parts = (reg.test(name) ? root + '/' + name : name).split('/');
      for (var i = 0, length = parts.length; i < length; i++) {
        part = parts[i];
        if (part === '..') {
          results.pop();
        } else if (part !== '.' && part !== '') {
          results.push(part);
        }
      }
      return results.join('/');
    };
  })();
  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';
    path = unalias(name, loaderPath);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has.call(cache, dirIndex)) return cache[dirIndex].exports;
    if (has.call(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  require.list = function() {
    var result = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  require.brunch = true;
  globals.require = require;
})();
require.register("schemas/definitions/bus", function(exports, require, module) {
module.exports = {
  bus: {
    title: 'Bus',
    id: 'bus',
    $schema: 'http://json-schema.org/draft-04/schema#',
    description: 'Bus',
    type: 'object',
    properties: {
      joined: {
        type: ['boolean', 'null']
      },
      players: {
        type: 'object'
      }
    },
    required: ['joined', 'players'],
    additionalProperties: true
  }
};
});

;require.register("schemas/definitions/misc", function(exports, require, module) {
module.exports = {
  jQueryEvent: {
    title: 'jQuery Event',
    id: 'jQueryEvent',
    $schema: 'http://json-schema.org/draft-04/schema#',
    description: 'A standard jQuery Event',
    type: 'object',
    properties: {
      altKey: {
        type: 'boolean'
      }
    },
    required: [],
    additionalProperties: true
  }
};
});

;require.register("schemas/i18n_schema", function(exports, require, module) {
var ExampleSchema, c, languageCodeArrayRegex;

c = require('./schemas');

languageCodeArrayRegex = c.generateLanguageCodeArrayRegex();

ExampleSchema = {
  title: 'Example Schema',
  description: 'An example schema',
  type: 'object',
  properties: {
    text: {
      title: 'Text',
      description: 'A short message to display in the dialogue area. Markdown okay.',
      type: 'string',
      maxLength: 400
    },
    i18n: {
      '$ref': '#/definitions/i18n'
    }
  },
  definitions: {
    i18n: {
      title: 'i18n',
      description: 'The internationalization object',
      type: 'object',
      patternProperties: {
        languageCodeArrayRegex: {
          additionalProperties: false,
          properties: {
            properties: {
              '$ref': '#/properties'
            }
          },
          "default": {
            title: 'LanguageCode',
            description: 'LanguageDescription'
          }
        }
      }
    }
  }
};
});

;require.register("schemas/languages", function(exports, require, module) {
var code, language, languageAliases, languageCodeFromAcceptedLanguages, languageCodes, languageCodesLower, languages, locale, localeInfo;

locale = require('../locale/locale');

languages = [];

for (code in locale) {
  localeInfo = locale[code];
  languages.push({
    code: code,
    nativeDescription: localeInfo.nativeDescription,
    englishDescription: localeInfo.englishDescription
  });
}

module.exports.languages = languages;

module.exports.languageCodes = languageCodes = (function() {
  var i, len, results;
  results = [];
  for (i = 0, len = languages.length; i < len; i++) {
    language = languages[i];
    results.push(language.code);
  }
  return results;
})();

module.exports.languageCodesLower = languageCodesLower = (function() {
  var i, len, results;
  results = [];
  for (i = 0, len = languageCodes.length; i < len; i++) {
    code = languageCodes[i];
    results.push(code.toLowerCase());
  }
  return results;
})();

languageAliases = {
  'en': 'en-US',
  'zh-cn': 'zh-HANS',
  'zh-hans-cn': 'zh-HANS',
  'zh-sg': 'zh-HANS',
  'zh-hans-sg': 'zh-HANS',
  'zh-tw': 'zh-HANT',
  'zh-hant-tw': 'zh-HANT',
  'zh-hk': 'zh-HANT',
  'zh-hant-hk': 'zh-HANT',
  'zh-mo': 'zh-HANT',
  'zh-hant-mo': 'zh-HANT'
};

module.exports.languageCodeFromAcceptedLanguages = languageCodeFromAcceptedLanguages = function(acceptedLanguages) {
  var codeIndex, i, lang, len, ref;
  ref = acceptedLanguages != null ? acceptedLanguages : [];
  for (i = 0, len = ref.length; i < len; i++) {
    lang = ref[i];
    code = languageAliases[lang.toLowerCase()];
    if (code) {
      return code;
    }
    codeIndex = _.indexOf(languageCodesLower, lang);
    if (codeIndex !== -1) {
      return languageCodes[codeIndex];
    }
  }
  return 'en-US';
};
});

;require.register("schemas/metaschema", function(exports, require, module) {
module.exports = {
  id: 'metaschema',
  displayProperty: 'title',
  $schema: 'http://json-schema.org/draft-04/schema#',
  title: 'Schema',
  description: 'Core schema meta-schema',
  definitions: {
    schemaArray: {
      type: 'array',
      minItems: 1,
      items: {
        $ref: '#'
      },
      title: 'Array of Schemas',
      'default': [{}]
    },
    positiveInteger: {
      type: 'integer',
      minimum: 0,
      title: 'Positive Integer'
    },
    positiveIntegerDefault0: {
      allOf: [
        {
          $ref: '#/definitions/positiveInteger'
        }, {
          'default': 0
        }
      ]
    },
    simpleTypes: {
      title: 'Single Type',
      'enum': ['array', 'boolean', 'integer', 'null', 'number', 'object', 'string']
    },
    stringArray: {
      type: 'array',
      items: {
        type: 'string'
      },
      minItems: 1,
      uniqueItems: true,
      title: 'String Array',
      'default': ['']
    }
  },
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'uri'
    },
    $schema: {
      type: 'string',
      format: 'uri',
      'default': 'http://json-schema.org/draft-04/schema#'
    },
    title: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    'default': {},
    multipleOf: {
      type: 'number',
      minimum: 0,
      exclusiveMinimum: true
    },
    maximum: {
      type: 'number'
    },
    exclusiveMaximum: {
      type: 'boolean',
      'default': false
    },
    minimum: {
      type: 'number'
    },
    exclusiveMinimum: {
      type: 'boolean',
      'default': false
    },
    maxLength: {
      $ref: '#/definitions/positiveInteger'
    },
    minLength: {
      $ref: '#/definitions/positiveIntegerDefault0'
    },
    pattern: {
      type: 'string',
      format: 'regex'
    },
    additionalItems: {
      anyOf: [
        {
          type: 'boolean',
          'default': false
        }, {
          $ref: '#'
        }
      ]
    },
    items: {
      anyOf: [
        {
          $ref: '#'
        }, {
          $ref: '#/definitions/schemaArray'
        }
      ],
      'default': {}
    },
    maxItems: {
      $ref: '#/definitions/positiveInteger'
    },
    minItems: {
      $ref: '#/definitions/positiveIntegerDefault0'
    },
    uniqueItems: {
      type: 'boolean',
      'default': false
    },
    maxProperties: {
      $ref: '#/definitions/positiveInteger'
    },
    minProperties: {
      $ref: '#/definitions/positiveIntegerDefault0'
    },
    required: {
      $ref: '#/definitions/stringArray'
    },
    additionalProperties: {
      anyOf: [
        {
          type: 'boolean',
          'default': true
        }, {
          $ref: '#'
        }
      ],
      'default': {}
    },
    definitions: {
      type: 'object',
      additionalProperties: {
        $ref: '#'
      },
      'default': {}
    },
    properties: {
      type: 'object',
      additionalProperties: {
        $ref: '#'
      },
      'default': {}
    },
    patternProperties: {
      type: 'object',
      additionalProperties: {
        $ref: '#'
      },
      'default': {}
    },
    dependencies: {
      type: 'object',
      additionalProperties: {
        anyOf: [
          {
            $ref: '#'
          }, {
            $ref: '#/definitions/stringArray'
          }
        ]
      }
    },
    'enum': {
      type: 'array',
      minItems: 1,
      uniqueItems: true,
      'default': ['']
    },
    type: {
      anyOf: [
        {
          $ref: '#/definitions/simpleTypes'
        }, {
          type: 'array',
          items: {
            $ref: '#/definitions/simpleTypes'
          },
          minItems: 1,
          uniqueItems: true,
          title: 'Array of Types',
          'default': ['string']
        }
      ]
    },
    allOf: {
      $ref: '#/definitions/schemaArray'
    },
    anyOf: {
      $ref: '#/definitions/schemaArray'
    },
    oneOf: {
      $ref: '#/definitions/schemaArray'
    },
    not: {
      $ref: '#'
    }
  },
  dependencies: {
    exclusiveMaximum: ['maximum'],
    exclusiveMinimum: ['minimum']
  },
  'default': {}
};
});

;require.register("schemas/models/achievement", function(exports, require, module) {
var AchievementSchema, MongoFindQuerySchema, MongoQueryOperatorSchema, c;

c = require('./../schemas');

MongoQueryOperatorSchema = {
  title: 'Query Operator',
  type: 'object',
  properties: {
    '$gt': {
      type: 'number'
    },
    '$gte': {
      type: 'number'
    },
    '$in': {
      type: 'array'
    },
    '$lt': {
      type: 'number'
    },
    '$lte': {
      type: 'number'
    },
    '$ne': {
      type: ['number', 'string']
    },
    '$nin': {
      type: 'array'
    },
    '$exists': {
      type: 'boolean'
    }
  },
  additionalProperties: false
};

MongoFindQuerySchema = {
  title: 'Query',
  type: 'object',
  patternProperties: {
    '^[-a-zA-Z0-9._]*$': {
      anyOf: [
        {
          $ref: '#/definitions/mongoQueryOperator'
        }, {
          type: 'string'
        }, {
          type: 'object'
        }, {
          type: 'boolean'
        }
      ]
    }
  },
  properties: {},
  additionalProperties: false,
  definitions: {}
};

AchievementSchema = c.object();

c.extendNamedProperties(AchievementSchema);

c.extendBasicProperties(AchievementSchema, 'achievement');

c.extendSearchableProperties(AchievementSchema);

AchievementSchema["default"] = {
  worth: 10,
  description: 'Probably the coolest you\'ll ever get.',
  difficulty: 1,
  recalculable: true,
  "function": {}
};

_.extend(AchievementSchema.properties, {
  query: {
    $ref: '#/definitions/mongoFindQuery'
  },
  worth: c.float(),
  collection: {
    type: 'string'
  },
  description: c.shortString(),
  userField: c.shortString(),
  related: c.objectId({
    description: 'Related entity'
  }),
  icon: {
    type: 'string',
    format: 'image-file',
    title: 'Icon',
    description: 'Image should be a 100x100 transparent png.'
  },
  category: {
    "enum": ['level', 'ladder', 'contributor'],
    description: 'For categorizing and display purposes'
  },
  difficulty: c.int({
    description: 'The higher the more difficult'
  }),
  proportionalTo: {
    type: 'string',
    description: 'For repeatables only. Denotes the field a repeatable achievement needs for its calculations'
  },
  recalculable: {
    type: 'boolean',
    description: 'Deprecated: all achievements must be recalculable now. Used to need to be set to true before it is eligible for recalculation.'
  },
  "function": {
    type: 'object',
    description: 'Function that gives total experience for X amount achieved',
    properties: {
      kind: {
        "enum": ['linear', 'logarithmic', 'quadratic', 'pow']
      },
      parameters: {
        type: 'object',
        "default": {
          a: 1,
          b: 0,
          c: 0
        },
        properties: {
          a: {
            type: 'number'
          },
          b: {
            type: 'number'
          },
          c: {
            type: 'number'
          }
        },
        additionalProperties: true
      }
    },
    "default": {
      kind: 'linear',
      parameters: {}
    },
    required: ['kind', 'parameters'],
    additionalProperties: false
  },
  i18n: {
    type: 'object',
    format: 'i18n',
    props: ['name', 'description'],
    description: 'Help translate this achievement'
  },
  rewards: c.RewardSchema('awarded by this achievement'),
  hidden: {
    type: 'boolean',
    description: 'Hide achievement from user if true'
  },
  updated: c.stringDate({
    description: 'When the achievement was changed in such a way that earned achievements should get updated.'
  })
});

_.extend(AchievementSchema, {
  additionalProperties: false
});

AchievementSchema.definitions = {};

AchievementSchema.definitions['mongoQueryOperator'] = MongoQueryOperatorSchema;

AchievementSchema.definitions['mongoFindQuery'] = MongoFindQuerySchema;

c.extendTranslationCoverageProperties(AchievementSchema);

c.extendPatchableProperties(AchievementSchema);

module.exports = AchievementSchema;
});

;require.register("schemas/models/analytics_log_event", function(exports, require, module) {
var AnalyticsLogEventSchema, c;

c = require('./../schemas');

AnalyticsLogEventSchema = c.object({
  title: 'Analytics Log Event',
  description: 'Analytics event logs.'
});

_.extend(AnalyticsLogEventSchema.properties, {
  u: c.objectId({
    links: [
      {
        rel: 'extra',
        href: '/db/user/{($)}'
      }
    ]
  }),
  e: {
    type: 'integer'
  },
  p: {
    type: 'object'
  },
  user: c.objectId({
    links: [
      {
        rel: 'extra',
        href: '/db/user/{($)}'
      }
    ]
  }),
  event: {
    type: 'string'
  },
  properties: {
    type: 'object'
  }
});

c.extendBasicProperties(AnalyticsLogEventSchema, 'analytics.log.event');

module.exports = AnalyticsLogEventSchema;
});

;require.register("schemas/models/analytics_perday", function(exports, require, module) {
var AnalyticsPerDaySchema, c;

c = require('./../schemas');

AnalyticsPerDaySchema = c.object({
  title: 'Analytics per-day data',
  description: 'Analytics data aggregated into per-day chunks.'
});

_.extend(AnalyticsPerDaySchema.properties, {
  d: {
    type: 'string'
  },
  e: {
    type: 'integer'
  },
  l: {
    type: 'integer'
  },
  f: {
    type: 'integer'
  },
  fv: {
    type: 'integer'
  },
  c: {
    type: 'integer'
  }
});

c.extendBasicProperties(AnalyticsPerDaySchema, 'analytics.perday');

module.exports = AnalyticsPerDaySchema;
});

;require.register("schemas/models/analytics_string", function(exports, require, module) {
var AnalyticsStringSchema, c;

c = require('./../schemas');

AnalyticsStringSchema = c.object({
  title: 'Analytics String',
  description: 'Maps strings to number IDs for improved performance.'
});

_.extend(AnalyticsStringSchema.properties, {
  v: {
    type: 'string'
  }
});

c.extendBasicProperties(AnalyticsStringSchema, 'analytics.string');

module.exports = AnalyticsStringSchema;
});

;require.register("schemas/models/analytics_stripe_invoice", function(exports, require, module) {
var AnalyticsStripeInvoiceSchema, c;

c = require('./../schemas');

AnalyticsStripeInvoiceSchema = c.object({
  title: 'Analytics Stripe Invoice'
});

_.extend(AnalyticsStripeInvoiceSchema.properties, {
  _id: {
    type: 'string'
  },
  date: {
    type: 'integer'
  },
  properties: {
    type: 'object'
  }
});

c.extendBasicProperties(AnalyticsStripeInvoiceSchema, 'analytics.stripe.invoice');

module.exports = AnalyticsStripeInvoiceSchema;
});

;require.register("schemas/models/analytics_users_active", function(exports, require, module) {
var AnalyticsUsersActiveSchema, c;

c = require('./../schemas');

AnalyticsUsersActiveSchema = c.object({
  title: 'Analytics Users Active',
  description: 'Active users data.'
});

_.extend(AnalyticsUsersActiveSchema.properties, {
  creator: c.objectId({
    links: [
      {
        rel: 'extra',
        href: '/db/user/{($)}'
      }
    ]
  }),
  created: c.date({
    title: 'Created',
    readOnly: true
  }),
  event: {
    type: 'string'
  }
});

c.extendBasicProperties(AnalyticsUsersActiveSchema, 'analytics.users.active');

module.exports = AnalyticsUsersActiveSchema;
});

;require.register("schemas/models/api-client.schema", function(exports, require, module) {
var APIClientSchema, c;

c = require('./../schemas');

APIClientSchema = {
  description: 'Third parties who can make API calls, usually on behalf of a user.',
  type: 'object',
  properties: {
    secret: {
      type: 'string',
      description: 'hashed version of a secret key that is required for API calls'
    }
  }
};

c.extendBasicProperties(APIClientSchema, 'Client');

module.exports = APIClientSchema;
});

;require.register("schemas/models/article", function(exports, require, module) {
var ArticleSchema, c;

c = require('./../schemas');

ArticleSchema = c.object();

c.extendNamedProperties(ArticleSchema);

ArticleSchema.properties.body = {
  type: 'string',
  title: 'Content',
  format: 'markdown'
};

ArticleSchema.properties.i18n = {
  type: 'object',
  title: 'i18n',
  format: 'i18n',
  props: ['name', 'body']
};

c.extendBasicProperties(ArticleSchema, 'article');

c.extendSearchableProperties(ArticleSchema);

c.extendVersionedProperties(ArticleSchema, 'article');

c.extendTranslationCoverageProperties(ArticleSchema);

c.extendPatchableProperties(ArticleSchema);

module.exports = ArticleSchema;
});

;require.register("schemas/models/campaign.schema", function(exports, require, module) {
var CampaignSchema, c;

c = require('./../schemas');

CampaignSchema = c.object({
  "default": {
    type: 'hero'
  }
});

c.extendNamedProperties(CampaignSchema);

_.extend(CampaignSchema.properties, {
  i18n: {
    type: 'object',
    title: 'i18n',
    format: 'i18n',
    props: ['name', 'fullName', 'description']
  },
  fullName: {
    type: 'string',
    title: 'Full Name',
    description: 'Ex.: "Kithgard Dungeon"'
  },
  description: {
    type: 'string',
    format: 'string',
    description: 'How long it takes and what players learn.'
  },
  type: c.shortString({
    title: 'Type',
    description: 'What kind of campaign this is.',
    'enum': ['hero', 'course', 'hidden']
  }),
  ambientSound: c.object({}, {
    mp3: {
      type: 'string',
      format: 'sound-file'
    },
    ogg: {
      type: 'string',
      format: 'sound-file'
    }
  }),
  backgroundImage: c.array({}, {
    type: 'object',
    additionalProperties: false,
    properties: {
      image: {
        type: 'string',
        format: 'image-file'
      },
      width: {
        type: 'number'
      }
    }
  }),
  backgroundColor: {
    type: 'string'
  },
  backgroundColorTransparent: {
    type: 'string'
  },
  adjacentCampaigns: {
    type: 'object',
    format: 'campaigns',
    additionalProperties: {
      title: 'Campaign',
      type: 'object',
      format: 'campaign',
      properties: {
        id: {
          type: 'string',
          format: 'hidden'
        },
        name: {
          type: 'string',
          format: 'hidden'
        },
        description: {
          type: 'string',
          format: 'hidden'
        },
        i18n: {
          type: 'object',
          format: 'hidden'
        },
        slug: {
          type: 'string',
          format: 'hidden'
        },
        position: c.point2d(),
        rotation: {
          type: 'number',
          format: 'degrees'
        },
        color: {
          type: 'string'
        },
        showIfUnlocked: {
          oneOf: [
            {
              type: 'string',
              links: [
                {
                  rel: 'db',
                  href: '/db/level/{($)}/version'
                }
              ],
              format: 'latest-version-original-reference'
            }, {
              type: 'array',
              items: {
                type: 'string',
                links: [
                  {
                    rel: 'db',
                    href: '/db/level/{($)}/version'
                  }
                ],
                format: 'latest-version-original-reference'
              }
            }
          ]
        }
      }
    }
  },
  levelsUpdated: c.date(),
  levels: {
    type: 'object',
    format: 'levels',
    additionalProperties: {
      title: 'Level',
      type: 'object',
      format: 'level',
      additionalProperties: false,
      properties: {
        name: {
          type: 'string',
          format: 'hidden'
        },
        description: {
          type: 'string',
          format: 'hidden'
        },
        i18n: {
          type: 'object',
          format: 'hidden'
        },
        requiresSubscription: {
          type: 'boolean'
        },
        replayable: {
          type: 'boolean'
        },
        type: {
          'enum': ['ladder', 'ladder-tutorial', 'hero', 'hero-ladder', 'hero-coop', 'course', 'course-ladder', 'game-dev', 'web-dev']
        },
        slug: {
          type: 'string',
          format: 'hidden'
        },
        original: {
          type: 'string',
          format: 'hidden'
        },
        adventurer: {
          type: 'boolean'
        },
        practice: {
          type: 'boolean'
        },
        practiceThresholdMinutes: {
          type: 'number'
        },
        primerLanguage: {
          type: 'string',
          "enum": ['javascript', 'python']
        },
        shareable: {
          title: 'Shareable',
          type: ['string', 'boolean'],
          "enum": [false, true, 'project'],
          description: 'Whether the level is not shareable, shareable, or a sharing-encouraged project level.'
        },
        adminOnly: {
          type: 'boolean'
        },
        disableSpaces: {
          type: ['boolean', 'number']
        },
        hidesSubmitUntilRun: {
          type: 'boolean'
        },
        hidesPlayButton: {
          type: 'boolean'
        },
        hidesRunShortcut: {
          type: 'boolean'
        },
        hidesHUD: {
          type: 'boolean'
        },
        hidesSay: {
          type: 'boolean'
        },
        hidesCodeToolbar: {
          type: 'boolean'
        },
        hidesRealTimePlayback: {
          type: 'boolean'
        },
        backspaceThrottle: {
          type: 'boolean'
        },
        lockDefaultCode: {
          type: ['boolean', 'number']
        },
        moveRightLoopSnippet: {
          type: 'boolean'
        },
        realTimeSpeedFactor: {
          type: 'number'
        },
        autocompleteFontSizePx: {
          type: 'number'
        },
        requiredCode: c.array({}, {
          type: 'string'
        }),
        suspectCode: c.array({}, {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            pattern: {
              type: 'string'
            }
          }
        }),
        requiredGear: {
          type: 'object',
          additionalProperties: {
            type: 'array',
            items: {
              type: 'string',
              links: [
                {
                  rel: 'db',
                  href: '/db/thang.type/{($)}/version'
                }
              ],
              format: 'latest-version-original-reference'
            }
          }
        },
        restrictedGear: {
          type: 'object',
          additionalProperties: {
            type: 'array',
            items: {
              type: 'string',
              links: [
                {
                  rel: 'db',
                  href: '/db/thang.type/{($)}/version'
                }
              ],
              format: 'latest-version-original-reference'
            }
          }
        },
        allowedHeroes: {
          type: 'array',
          items: {
            type: 'string',
            links: [
              {
                rel: 'db',
                href: '/db/thang.type/{($)}/version'
              }
            ],
            format: 'latest-version-original-reference'
          }
        },
        rewards: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              achievement: {
                type: 'string',
                links: [
                  {
                    rel: 'db',
                    href: '/db/achievement/{{$}}'
                  }
                ],
                format: 'achievement'
              },
              item: {
                type: 'string',
                links: [
                  {
                    rel: 'db',
                    href: '/db/thang.type/{($)}/version'
                  }
                ],
                format: 'latest-version-original-reference'
              },
              hero: {
                type: 'string',
                links: [
                  {
                    rel: 'db',
                    href: '/db/thang.type/{($)}/version'
                  }
                ],
                format: 'latest-version-original-reference'
              },
              level: {
                type: 'string',
                links: [
                  {
                    rel: 'db',
                    href: '/db/level/{($)}/version'
                  }
                ],
                format: 'latest-version-original-reference'
              },
              type: {
                "enum": ['heroes', 'items', 'levels']
              }
            }
          }
        },
        campaign: c.shortString({
          title: 'Campaign',
          description: 'Which campaign this level is part of (like "desert").',
          format: 'hidden'
        }),
        campaignIndex: c.int({
          title: 'Campaign Index',
          description: 'The 0-based index of this level in its campaign.',
          format: 'hidden'
        }),
        scoreTypes: c.array({
          title: 'Score Types',
          description: 'What metric to show leaderboards for.',
          uniqueItems: true
        }, c.shortString({
          title: 'Score Type',
          'enum': ['time', 'damage-taken', 'damage-dealt', 'gold-collected', 'difficulty']
        })),
        tasks: c.array({
          title: 'Tasks',
          description: 'Tasks to be completed for this level.'
        }, c.task),
        concepts: c.array({
          title: 'Programming Concepts',
          description: 'Which programming concepts this level covers.'
        }, c.concept),
        picoCTFProblem: {
          type: 'string',
          description: 'Associated picoCTF problem ID, if this is a picoCTF level'
        },
        position: c.point2d()
      }
    }
  }
});

c.extendBasicProperties(CampaignSchema, 'campaign');

c.extendTranslationCoverageProperties(CampaignSchema);

c.extendPatchableProperties(CampaignSchema);

module.exports = CampaignSchema;
});

;require.register("schemas/models/cla_submission", function(exports, require, module) {
var CLASubmissionSchema, c;

c = require('./../schemas');

CLASubmissionSchema = c.object({
  title: 'CLA Submission',
  description: 'Recording when a user signed the CLA.'
});

_.extend(CLASubmissionSchema.properties, {
  user: c.objectId({
    links: [
      {
        rel: 'extra',
        href: '/db/user/{($)}'
      }
    ]
  }),
  email: c.shortString({
    format: 'email'
  }),
  name: {
    type: 'string'
  },
  githubUsername: c.shortString(),
  created: c.date({
    title: 'Created',
    readOnly: true
  })
});

c.extendBasicProperties(CLASubmissionSchema, 'user.remark');

module.exports = CLASubmissionSchema;
});

;require.register("schemas/models/clan.schema", function(exports, require, module) {
var ClanSchema, c;

c = require('./../schemas');

ClanSchema = c.object({
  title: 'Clan',
  required: ['name', 'type']
});

c.extendNamedProperties(ClanSchema);

_.extend(ClanSchema.properties, {
  description: {
    type: 'string'
  },
  members: c.array({
    title: 'Members'
  }, c.objectId()),
  ownerID: c.objectId(),
  type: {
    type: 'string',
    'enum': ['public', 'private'],
    description: 'Controls clan general visibility.'
  },
  dashboardType: {
    type: 'string',
    'enum': ['basic', 'premium']
  }
});

c.extendBasicProperties(ClanSchema, 'Clan');

module.exports = ClanSchema;
});

;require.register("schemas/models/classroom.schema", function(exports, require, module) {
var ClassroomSchema, c;

c = require('./../schemas');

ClassroomSchema = c.object({
  title: 'Classroom',
  required: ['name']
});

c.extendNamedProperties(ClassroomSchema);

_.extend(ClassroomSchema.properties, {
  name: {
    type: 'string',
    minLength: 1
  },
  members: c.array({
    title: 'Members'
  }, c.objectId()),
  deletedMembers: c.array({
    title: 'Deleted Members'
  }, c.objectId()),
  ownerID: c.objectId(),
  description: {
    type: 'string'
  },
  code: c.shortString({
    title: "Unique code to redeem"
  }),
  codeCamel: c.shortString({
    title: "UpperCamelCase version of code for display purposes"
  }),
  aceConfig: {
    language: {
      type: 'string',
      'enum': ['python', 'javascript']
    }
  },
  averageStudentExp: {
    type: 'string'
  },
  ageRangeMin: {
    type: 'string'
  },
  ageRangeMax: {
    type: 'string'
  },
  archived: {
    type: 'boolean',
    "default": false,
    description: 'Visual only; determines if the classroom is in the "archived" list of the normal list.'
  },
  courses: c.array({
    title: 'Courses'
  }, c.object({
    title: 'Course'
  }, {
    _id: c.objectId(),
    levels: c.array({
      title: 'Levels'
    }, c.object({
      title: 'Level'
    }, {
      practice: {
        type: 'boolean'
      },
      practiceThresholdMinutes: {
        type: 'number'
      },
      primerLanguage: {
        type: 'string',
        "enum": ['javascript', 'python']
      },
      shareable: {
        title: 'Shareable',
        type: ['string', 'boolean'],
        "enum": [false, true, 'project'],
        description: 'Whether the level is not shareable, shareable, or a sharing-encouraged project level.'
      },
      type: c.shortString(),
      original: c.objectId(),
      name: {
        type: 'string'
      },
      slug: {
        type: 'string'
      }
    }))
  }))
});

c.extendBasicProperties(ClassroomSchema, 'Classroom');

module.exports = ClassroomSchema;
});

;require.register("schemas/models/codelog.schema", function(exports, require, module) {
var CodeLogSchema, LevelVersionSchema, c;

c = require('./../schemas');

LevelVersionSchema = c.object({
  required: ['original', 'majorVersion'],
  links: [
    {
      rel: 'db',
      href: '/db/level/{(original)}/version/{(majorVersion)}'
    }
  ]
}, {
  original: c.objectId(),
  majorVersion: {
    type: 'integer',
    minimum: 0
  }
});

CodeLogSchema = {
  type: 'object',
  properties: {
    sessionID: c.objectId(),
    level: LevelVersionSchema,
    levelSlug: {
      type: 'string'
    },
    userID: c.objectId(),
    log: {
      type: 'string'
    },
    created: c.date()
  }
};

module.exports = CodeLogSchema;
});

;require.register("schemas/models/course.schema", function(exports, require, module) {
var CourseSchema, c;

c = require('./../schemas');

CourseSchema = c.object({
  title: 'Course',
  required: ['name']
});

c.extendNamedProperties(CourseSchema);

_.extend(CourseSchema.properties, {
  i18n: {
    type: 'object',
    title: 'i18n',
    format: 'i18n',
    props: ['name', 'description']
  },
  campaignID: c.objectId(),
  concepts: c.array({
    title: 'Programming Concepts',
    uniqueItems: true
  }, c.concept),
  description: {
    type: 'string'
  },
  duration: {
    type: 'number',
    description: 'Approximate hours of content'
  },
  pricePerSeat: {
    type: 'number',
    description: 'Price per seat in USD cents.'
  },
  free: {
    type: 'boolean'
  },
  screenshot: c.path({
    title: 'URL',
    description: 'Link to course screenshot.'
  }),
  adminOnly: {
    type: 'boolean',
    description: 'Deprecated in favor of releasePhase.'
  },
  releasePhase: {
    "enum": ['beta', 'released'],
    description: "How far along the course's development is, determining who sees it."
  }
});

c.extendBasicProperties(CourseSchema, 'Course');

c.extendTranslationCoverageProperties(CourseSchema);

c.extendPatchableProperties(CourseSchema);

module.exports = CourseSchema;
});

;require.register("schemas/models/course_instance.schema", function(exports, require, module) {
var CourseInstanceSchema, c;

c = require('./../schemas');

CourseInstanceSchema = c.object({
  title: 'Course Instance'
});

_.extend(CourseInstanceSchema.properties, {
  courseID: c.objectId(),
  classroomID: c.objectId(),
  description: {
    type: 'string'
  },
  members: c.array({
    title: 'Members'
  }, c.objectId()),
  name: {
    type: 'string'
  },
  ownerID: c.objectId(),
  prepaidID: c.objectId(),
  aceConfig: {
    language: {
      type: 'string',
      'enum': ['python', 'javascript']
    }
  },
  hourOfCode: {
    type: 'boolean',
    description: 'Deprecated, do not use.'
  }
});

c.extendBasicProperties(CourseInstanceSchema, 'CourseInstance');

module.exports = CourseInstanceSchema;
});

;require.register("schemas/models/earned_achievement", function(exports, require, module) {
var EarnedAchievementSchema, c;

c = require('./../schemas');

module.exports = EarnedAchievementSchema = {
  type: 'object',
  "default": {
    previouslyAchievedAmount: 0
  },
  properties: {
    user: c.objectId({
      links: [
        {
          rel: 'extra',
          href: '/db/user/{($)}'
        }
      ]
    }),
    achievement: c.objectId({
      links: [
        {
          rel: 'extra',
          href: '/db/achievement/{($)}'
        }
      ]
    }),
    collection: {
      type: 'string'
    },
    triggeredBy: c.objectId(),
    achievementName: {
      type: 'string'
    },
    created: {
      type: ['date', 'string', 'number']
    },
    changed: {
      type: ['date', 'string', 'number']
    },
    achievedAmount: {
      type: 'number'
    },
    earnedPoints: {
      type: 'number'
    },
    previouslyAchievedAmount: {
      type: 'number'
    },
    earnedRewards: c.RewardSchema('awarded by this achievement to this user'),
    notified: {
      type: 'boolean'
    }
  }
};
});

;require.register("schemas/models/level", function(exports, require, module) {
var EventPrereqSchema, GeneralArticleSchema, GoalSchema, LevelSchema, LevelSystemSchema, LevelThangSchema, NoteGroupSchema, PointSchema, ResponseSchema, ScriptSchema, SpecificArticleSchema, SpriteCommandSchema, ThangComponentSchema, c, defaultTasks, eventPrereqValueTypes, side, t, thang;

c = require('./../schemas');

ThangComponentSchema = require('./thang_component');

defaultTasks = ['Name the level.', 'Create a Referee stub, if needed.', 'Do basic set decoration.', 'Publish.', 'Build the level.', 'Set up goals.', 'Write the sample code.', 'Make sure the level ends promptly on success and failure.', 'Choose the Existence System lifespan and frame rate.', 'Choose the UI System paths and coordinate hover if needed.', 'Choose the AI System pathfinding and Vision System line of sight.', 'Adjust script camera bounds.', 'Choose music file in Introduction script.', 'Choose autoplay in Introduction script.', 'Add Lua/CoffeeScript/Java.', 'Write the description.', 'Write the guide.', 'Write a loading tip, if needed.', 'Add programming concepts covered.', 'Mark whether it requires a subscription.', 'Choose leaderboard score types.', 'Do thorough set decoration.', 'Playtest with a slow/tough hero.', 'Playtest with a fast/weak hero.', 'Playtest with a couple random seeds.', 'Remove/simplify unnecessary doodad collision.', 'Add to a campaign.', 'Choose level options like required/restricted gear.', 'Create achievements, including unlocking next level.', 'Click the Populate i18n button.', 'Add i18n field for the sample code comments.', 'Release to adventurers via MailChimp.', 'Release to everyone via MailChimp.', 'Check completion/engagement/problem analytics.', 'Add a walkthrough video.'];

SpecificArticleSchema = c.object();

c.extendNamedProperties(SpecificArticleSchema);

SpecificArticleSchema.properties.body = {
  type: 'string',
  title: 'Content',
  description: 'The body content of the article, in Markdown.',
  format: 'markdown'
};

SpecificArticleSchema.properties.i18n = {
  type: 'object',
  format: 'i18n',
  props: ['name', 'body'],
  description: 'Help translate this article'
};

SpecificArticleSchema.displayProperty = 'name';

side = {
  title: 'Side',
  description: 'A side.',
  type: 'string',
  'enum': ['left', 'right', 'top', 'bottom']
};

thang = {
  title: 'Thang',
  description: 'The name of a Thang.',
  type: 'string',
  maxLength: 60,
  format: 'thang'
};

eventPrereqValueTypes = ['boolean', 'integer', 'number', 'null', 'string'];

EventPrereqSchema = c.object({
  title: 'Event Prerequisite',
  format: 'event-prereq',
  description: 'Script requires that the value of some property on the event triggering it to meet some prerequisite.',
  required: ['eventProps']
}, {
  eventProps: c.array({
    'default': ['thang'],
    format: 'event-value-chain',
    maxItems: 10,
    title: 'Event Property',
    description: 'A chain of keys in the event, like "thang.pos.x" to access event.thang.pos.x.'
  }, c.shortString({
    title: 'Property',
    description: 'A key in the event property key chain.'
  })),
  equalTo: c.object({
    type: eventPrereqValueTypes,
    title: '==',
    description: 'Script requires the event\'s property chain value to be equal to this value.'
  }),
  notEqualTo: c.object({
    type: eventPrereqValueTypes,
    title: '!=',
    description: 'Script requires the event\'s property chain value to *not* be equal to this value.'
  }),
  greaterThan: {
    type: 'number',
    title: '>',
    description: 'Script requires the event\'s property chain value to be greater than this value.'
  },
  greaterThanOrEqualTo: {
    type: 'number',
    title: '>=',
    description: 'Script requires the event\'s property chain value to be greater or equal to this value.'
  },
  lessThan: {
    type: 'number',
    title: '<',
    description: 'Script requires the event\'s property chain value to be less than this value.'
  },
  lessThanOrEqualTo: {
    type: 'number',
    title: '<=',
    description: 'Script requires the event\'s property chain value to be less than or equal to this value.'
  },
  containingString: c.shortString({
    title: 'Contains',
    description: 'Script requires the event\'s property chain value to be a string containing this string.'
  }),
  notContainingString: c.shortString({
    title: 'Does not contain',
    description: 'Script requires the event\'s property chain value to *not* be a string containing this string.'
  }),
  containingRegexp: c.shortString({
    title: 'Contains Regexp',
    description: 'Script requires the event\'s property chain value to be a string containing this regular expression.'
  }),
  notContainingRegexp: c.shortString({
    title: 'Does not contain regexp',
    description: 'Script requires the event\'s property chain value to *not* be a string containing this regular expression.'
  })
});

GoalSchema = c.object({
  title: 'Goal',
  description: 'A goal that the player can accomplish.',
  required: ['name', 'id']
}, {
  name: c.shortString({
    title: 'Name',
    description: 'Name of the goal that the player will see, like \"Defeat eighteen dragons\".'
  }),
  i18n: {
    type: 'object',
    format: 'i18n',
    props: ['name'],
    description: 'Help translate this goal'
  },
  id: c.shortString({
    title: 'ID',
    description: 'Unique identifier for this goal, like \"defeat-dragons\".',
    pattern: '^[a-z0-9-]+$'
  }),
  worldEndsAfter: {
    title: 'World Ends After',
    description: 'When included, ends the world this many seconds after this goal succeeds or fails.',
    type: 'number',
    minimum: 0,
    exclusiveMinimum: true,
    maximum: 300,
    "default": 3
  },
  howMany: {
    title: 'How Many',
    description: 'When included, require only this many of the listed goal targets instead of all of them.',
    type: 'integer',
    minimum: 1
  },
  hiddenGoal: {
    title: 'Hidden',
    description: 'Hidden goals don\'t show up in the goals area for the player until they\'re failed. (Usually they\'re obvious, like "don\'t die".)',
    'type': 'boolean'
  },
  optional: {
    title: 'Optional',
    description: 'Optional goals do not need to be completed for overallStatus to be success.',
    type: 'boolean'
  },
  team: c.shortString({
    title: 'Team',
    description: 'Name of the team this goal is for, if it is not for all of the playable teams.'
  }),
  killThangs: c.array({
    title: 'Kill Thangs',
    description: 'A list of Thang IDs the player should kill, or team names.',
    uniqueItems: true,
    minItems: 1,
    'default': ['ogres']
  }, thang),
  saveThangs: c.array({
    title: 'Save Thangs',
    description: 'A list of Thang IDs the player should save, or team names',
    uniqueItems: true,
    minItems: 1,
    'default': ['Hero Placeholder']
  }, thang),
  getToLocations: c.object({
    title: 'Get To Locations',
    description: 'Will be set off when any of the \"who\" touch any of the \"targets\"',
    required: ['who', 'targets']
  }, {
    who: c.array({
      title: 'Who',
      description: 'The Thangs who must get to the target locations.',
      minItems: 1
    }, thang),
    targets: c.array({
      title: 'Targets',
      description: 'The target locations to which the Thangs must get.',
      minItems: 1
    }, thang)
  }),
  getAllToLocations: c.array({
    title: 'Get all to locations',
    description: 'Similar to getToLocations but now a specific \"who\" can have a specific \"target\", also must be used with the HowMany property for desired effect',
    required: ['getToLocation']
  }, c.object({
    title: '',
    description: ''
  }, {
    getToLocation: c.object({
      title: 'Get To Locations',
      description: 'TODO: explain',
      required: ['who', 'targets']
    }, {
      who: c.array({
        title: 'Who',
        description: 'The Thangs who must get to the target locations.',
        minItems: 1
      }, thang),
      targets: c.array({
        title: 'Targets',
        description: 'The target locations to which the Thangs must get.',
        minItems: 1
      }, thang)
    })
  })),
  keepFromLocations: c.object({
    title: 'Keep From Locations',
    description: 'TODO: explain',
    required: ['who', 'targets']
  }, {
    who: c.array({
      title: 'Who',
      description: 'The Thangs who must not get to the target locations.',
      minItems: 1
    }, thang),
    targets: c.array({
      title: 'Targets',
      description: 'The target locations to which the Thangs must not get.',
      minItems: 1
    }, thang)
  }),
  keepAllFromLocations: c.array({
    title: 'Keep ALL From Locations',
    description: 'Similar to keepFromLocations but now a specific \"who\" can have a specific \"target\", also must be used with the HowMany property for desired effect',
    required: ['keepFromLocation']
  }, c.object({
    title: '',
    description: ''
  }, {
    keepFromLocation: c.object({
      title: 'Keep From Locations',
      description: 'TODO: explain',
      required: ['who', 'targets']
    }, {
      who: c.array({
        title: 'Who',
        description: 'The Thangs who must not get to the target locations.',
        minItems: 1
      }, thang),
      targets: c.array({
        title: 'Targets',
        description: 'The target locations to which the Thangs must not get.',
        minItems: 1
      }, thang)
    })
  })),
  leaveOffSides: c.object({
    title: 'Leave Off Sides',
    description: 'Sides of the level to get some Thangs to leave across.',
    required: ['who', 'sides']
  }, {
    who: c.array({
      title: 'Who',
      description: 'The Thangs which must leave off the sides of the level.',
      minItems: 1
    }, thang),
    sides: c.array({
      title: 'Sides',
      description: 'The sides off which the Thangs must leave.',
      minItems: 1
    }, side)
  }),
  keepFromLeavingOffSides: c.object({
    title: 'Keep From Leaving Off Sides',
    description: 'Sides of the level to keep some Thangs from leaving across.',
    required: ['who', 'sides']
  }, {
    who: c.array({
      title: 'Who',
      description: 'The Thangs which must not leave off the sides of the level.',
      minItems: 1
    }, thang),
    sides: side
  }, {
    title: 'Sides',
    description: 'The sides off which the Thangs must not leave.',
    minItems: 1
  }, side),
  collectThangs: c.object({
    title: 'Collect',
    description: 'Thangs that other Thangs must collect.',
    required: ['who', 'targets']
  }, {
    who: c.array({
      title: 'Who',
      description: 'The Thangs which must collect the target items.',
      minItems: 1
    }, thang),
    targets: c.array({
      title: 'Targets',
      description: 'The target items which the Thangs must collect.',
      minItems: 1
    }, thang)
  }),
  keepFromCollectingThangs: c.object({
    title: 'Keep From Collecting',
    description: 'Thangs that the player must prevent other Thangs from collecting.',
    required: ['who', 'targets']
  }, {
    who: c.array({
      title: 'Who',
      description: 'The Thangs which must not collect the target items.',
      minItems: 1
    }, thang),
    targets: c.array({
      title: 'Targets',
      description: 'The target items which the Thangs must not collect.',
      minItems: 1
    }, thang)
  }),
  codeProblems: c.array({
    title: 'Code Problems',
    description: 'A list of Thang IDs that should not have any code problems, or team names.',
    uniqueItems: true,
    minItems: 1,
    'default': ['humans']
  }, thang),
  linesOfCode: {
    title: 'Lines of Code',
    description: 'A mapping of Thang IDs or teams to how many many lines of code should be allowed (well, statements).',
    type: 'object',
    "default": {
      humans: 10
    },
    additionalProperties: {
      type: 'integer',
      description: 'How many lines to allow for this Thang.'
    }
  },
  html: c.object({
    title: 'HTML',
    description: 'A jQuery selector and what its result should be'
  }, {
    selector: {
      type: 'string',
      description: 'jQuery selector to run on the user HTML, like "h1:first-child"'
    },
    valueChecks: c.array({
      title: 'Value checks',
      description: 'Logical checks on the resulting value for this goal to pass.',
      format: 'event-prereqs'
    }, EventPrereqSchema)
  })
});

ResponseSchema = c.object({
  title: 'Dialogue Button',
  description: 'A button to be shown to the user with the dialogue.',
  required: ['text']
}, {
  text: {
    title: 'Title',
    description: 'The text that will be on the button',
    'default': 'Okay',
    type: 'string',
    maxLength: 30
  },
  channel: c.shortString({
    title: 'Channel',
    format: 'event-channel',
    description: 'Channel that this event will be broadcast over, like "level:set-playing".'
  }),
  event: {
    type: 'object',
    title: 'Event',
    description: 'Event that will be broadcast when this button is pressed, like {playing: true}.'
  },
  buttonClass: c.shortString({
    title: 'Button Class',
    description: 'CSS class that will be added to the button, like "btn-primary".'
  }),
  i18n: {
    type: 'object',
    format: 'i18n',
    props: ['text'],
    description: 'Help translate this button'
  }
});

PointSchema = c.object({
  title: 'Point',
  description: 'An {x, y} coordinate point.',
  format: 'point2d',
  "default": {
    x: 15,
    y: 20
  }
}, {
  x: {
    title: 'x',
    description: 'The x coordinate.',
    type: 'number'
  },
  y: {
    title: 'y',
    description: 'The y coordinate.',
    type: 'number'
  }
});

SpriteCommandSchema = c.object({
  title: 'Thang Command',
  description: 'Make a target Thang move or say something, or select/deselect it.',
  required: ['id'],
  "default": {
    id: 'Hero Placeholder'
  }
}, {
  id: thang,
  select: {
    title: 'Select',
    description: 'Select or deselect this Thang.',
    type: 'boolean'
  },
  say: c.object({
    title: 'Say',
    description: 'Make this Thang say a message.',
    required: ['text'],
    "default": {
      mood: 'explain'
    }
  }, {
    blurb: c.shortString({
      title: 'Blurb',
      description: 'A very short message to display above this Thang\'s head. Plain text.',
      maxLength: 50
    }),
    mood: c.shortString({
      title: 'Mood',
      description: 'The mood with which the Thang speaks.',
      'enum': ['explain', 'debrief', 'congrats', 'attack', 'joke', 'tip', 'alarm']
    }),
    text: {
      title: 'Text',
      description: 'A short message to display in the dialogue area. Markdown okay.',
      type: 'string',
      maxLength: 400
    },
    sound: c.object({
      title: 'Sound',
      description: 'A dialogue sound file to accompany the message.',
      required: ['mp3', 'ogg']
    }, {
      mp3: c.shortString({
        title: 'MP3',
        format: 'sound-file'
      }),
      ogg: c.shortString({
        title: 'OGG',
        format: 'sound-file'
      }),
      preload: {
        title: 'Preload',
        description: 'Whether to load this sound file before the level can begin (typically for the first dialogue of a level).',
        type: 'boolean'
      }
    }),
    responses: c.array({
      title: 'Buttons',
      description: 'An array of buttons to include with the dialogue, with which the user can respond.'
    }, ResponseSchema),
    i18n: {
      type: 'object',
      format: 'i18n',
      props: ['blurb', 'text', 'sound'],
      description: 'Help translate this message'
    }
  }),
  move: c.object({
    title: 'Move',
    description: 'Tell the Thang to move.',
    required: ['target'],
    "default": {
      target: {},
      duration: 500
    }
  }, {
    target: _.extend(_.cloneDeep(PointSchema), {
      title: 'Target',
      description: 'Target point to which the Thang will move.',
      "default": {
        x: 20,
        y: 20
      }
    }),
    duration: {
      title: 'Duration',
      description: 'Number of milliseconds over which to move, or 0 for an instant move.',
      type: 'integer',
      minimum: 0,
      format: 'milliseconds'
    }
  })
});

NoteGroupSchema = c.object({
  title: 'Note Group',
  description: 'A group of notes that should be sent out as a result of this script triggering.',
  displayProperty: 'name'
}, {
  name: {
    title: 'Name',
    description: 'Short name describing the script, like \"Anya greets the player\", for your convenience.',
    type: 'string'
  },
  dom: c.object({
    title: 'DOM',
    description: 'Manipulate things in the play area DOM, outside of the level area canvas.'
  }, {
    focus: c.shortString({
      title: 'Focus',
      description: 'Set the window focus to this DOM selector string.'
    }),
    showVictory: {
      title: 'Show Victory',
      description: 'Show the done button and maybe also the victory modal.',
      "enum": [true, 'Done Button', 'Done Button And Modal']
    },
    highlight: c.object({
      title: 'Highlight',
      description: 'Highlight the target DOM selector string with a big arrow.'
    }, {
      target: c.shortString({
        title: 'Target',
        description: 'Target highlight element DOM selector string.'
      }),
      delay: {
        type: 'integer',
        minimum: 0,
        title: 'Delay',
        description: 'Show the highlight after this many milliseconds. Doesn\'t affect the dim shade cutout highlight method.'
      },
      offset: _.extend(_.cloneDeep(PointSchema), {
        title: 'Offset',
        description: 'Pointing arrow tip offset in pixels from the default target.',
        format: null
      }),
      rotation: {
        type: 'number',
        minimum: 0,
        title: 'Rotation',
        description: 'Rotation of the pointing arrow, in radians. PI / 2 points left, PI points up, etc.',
        format: 'radians'
      },
      sides: c.array({
        title: 'Sides',
        description: 'Which sides of the target element to point at.'
      }, {
        type: 'string',
        'enum': ['left', 'right', 'top', 'bottom'],
        title: 'Side',
        description: 'A side of the target element to point at.'
      })
    }),
    lock: {
      title: 'Lock',
      description: 'Whether the interface should be locked so that the player\'s focus is on the script, or specific areas to lock.',
      type: ['boolean', 'array'],
      items: {
        type: 'string',
        "enum": ['surface', 'editor', 'palette', 'hud', 'playback', 'playback-hover', 'level']
      }
    },
    letterbox: {
      type: 'boolean',
      title: 'Letterbox',
      description: 'Turn letterbox mode on or off. Disables surface and playback controls.'
    }
  }),
  playback: c.object({
    title: 'Playback',
    description: 'Control the playback of the level.'
  }, {
    playing: {
      type: 'boolean',
      title: 'Set Playing',
      description: 'Set whether playback is playing or paused.'
    },
    scrub: c.object({
      title: 'Scrub',
      description: 'Scrub the level playback time to a certain point.',
      "default": {
        offset: 2,
        duration: 1000,
        toRatio: 0.5
      }
    }, {
      offset: {
        type: 'integer',
        title: 'Offset',
        description: 'Number of frames by which to adjust the scrub target time.'
      },
      duration: {
        type: 'integer',
        title: 'Duration',
        description: 'Number of milliseconds over which to scrub time.',
        minimum: 0,
        format: 'milliseconds'
      },
      toRatio: {
        type: 'number',
        title: 'To Progress Ratio',
        description: 'Set playback time to a target playback progress ratio.',
        minimum: 0,
        maximum: 1
      },
      toTime: {
        type: 'number',
        title: 'To Time',
        description: 'Set playback time to a target playback point, in seconds.',
        minimum: 0
      },
      toGoal: c.shortString({
        title: 'To Goal',
        description: 'Set playback time to when this goal was achieved. (TODO: not implemented.)'
      })
    })
  }),
  script: c.object({
    title: 'Script',
    description: 'Extra configuration for this action group.'
  }, {
    duration: {
      type: 'integer',
      minimum: 0,
      title: 'Duration',
      description: 'How long this script should last in milliseconds. 0 for indefinite.',
      format: 'milliseconds'
    },
    skippable: {
      type: 'boolean',
      title: 'Skippable',
      description: 'Whether this script shouldn\'t bother firing when the player skips past all current scripts.'
    },
    beforeLoad: {
      type: 'boolean',
      title: 'Before Load',
      description: 'Whether this script should fire before the level is finished loading.'
    }
  }),
  sprites: c.array({
    title: 'Sprites',
    description: 'Commands to issue to Sprites on the Surface.'
  }, SpriteCommandSchema),
  surface: c.object({
    title: 'Surface',
    description: 'Commands to issue to the Surface itself.'
  }, {
    focus: c.object({
      title: 'Camera',
      description: 'Focus the camera on a specific point on the Surface.',
      format: 'viewport'
    }, {
      target: {
        anyOf: [
          PointSchema, thang, {
            type: 'null'
          }
        ],
        title: 'Target',
        description: 'Where to center the camera view.',
        "default": {
          x: 0,
          y: 0
        }
      },
      zoom: {
        type: 'number',
        minimum: 0,
        exclusiveMinimum: true,
        maximum: 64,
        title: 'Zoom',
        description: 'What zoom level to use.'
      },
      duration: {
        type: 'number',
        minimum: 0,
        title: 'Duration',
        description: 'in ms'
      },
      bounds: c.array({
        title: 'Boundary',
        maxItems: 2,
        minItems: 2,
        "default": [
          {
            x: 0,
            y: 0
          }, {
            x: 46,
            y: 39
          }
        ],
        format: 'bounds'
      }, PointSchema),
      isNewDefault: {
        type: 'boolean',
        format: 'hidden',
        title: 'New Default',
        description: 'Set this as new default zoom once scripts end.'
      }
    }),
    highlight: c.object({
      title: 'Highlight',
      description: 'Highlight specific Sprites on the Surface.'
    }, {
      targets: c.array({
        title: 'Targets',
        description: 'Thang IDs of target Sprites to highlight.'
      }, thang),
      delay: {
        type: 'integer',
        minimum: 0,
        title: 'Delay',
        description: 'Delay in milliseconds before the highlight appears.'
      }
    }),
    lockSelect: {
      type: 'boolean',
      title: 'Lock Select',
      description: 'Whether to lock Sprite selection so that the player can\'t select/deselect anything.'
    }
  }),
  sound: c.object({
    title: 'Sound',
    description: 'Commands to control sound playback.'
  }, {
    suppressSelectionSounds: {
      type: 'boolean',
      title: 'Suppress Selection Sounds',
      description: 'Whether to suppress selection sounds made from clicking on Thangs.'
    },
    music: c.object({
      title: 'Music',
      description: 'Control music playing'
    }, {
      play: {
        title: 'Play',
        type: 'boolean'
      },
      file: c.shortString({
        title: 'File',
        "enum": ['/music/music_level_1', '/music/music_level_2', '/music/music_level_3', '/music/music_level_4', '/music/music_level_5']
      })
    })
  })
});

ScriptSchema = c.object({
  title: 'Script',
  description: 'A script fires off a chain of notes to interact with the game when a certain event triggers it.',
  required: ['channel'],
  'default': {
    channel: 'world:won',
    noteChain: []
  }
}, {
  id: c.shortString({
    title: 'ID',
    description: 'A unique ID that other scripts can rely on in their Happens After prereqs, for sequencing.',
    pattern: '^[a-zA-Z 0-9:\'"_!-]+$'
  }),
  channel: c.shortString({
    title: 'Event',
    format: 'event-channel',
    description: 'Event channel this script might trigger for, like "world:won".'
  }),
  eventPrereqs: c.array({
    title: 'Event Checks',
    description: 'Logical checks on the event for this script to trigger.',
    format: 'event-prereqs'
  }, EventPrereqSchema),
  repeats: {
    title: 'Repeats',
    description: 'Whether this script can trigger more than once during a level.',
    "enum": [true, false, 'session']
  },
  scriptPrereqs: c.array({
    title: 'Happens After',
    description: 'Scripts that need to fire first.'
  }, c.shortString({
    title: 'ID',
    description: 'A unique ID of a script.'
  })),
  notAfter: c.array({
    title: 'Not After',
    description: 'Do not run this script if any of these scripts have run.'
  }, c.shortString({
    title: 'ID',
    description: 'A unique ID of a script.'
  })),
  noteChain: c.array({
    title: 'Actions',
    description: 'A list of things that happen when this script triggers.'
  }, NoteGroupSchema)
});

LevelThangSchema = c.object({
  title: 'Thang',
  description: 'Thangs are any units, doodads, or abstract things that you use to build the level. (\"Thing\" was too confusing to say.)',
  format: 'thang',
  required: ['id', 'thangType', 'components'],
  'default': {
    id: 'Boris',
    thangType: 'Soldier',
    components: []
  }
}, {
  id: thang,
  thangType: c.objectId({
    links: [
      {
        rel: 'db',
        href: '/db/thang.type/{($)}/version'
      }
    ],
    title: 'Thang Type',
    description: 'A reference to the original Thang template being configured.',
    format: 'thang-type'
  }),
  components: c.array({
    title: 'Components',
    description: 'Thangs are configured by changing the Components attached to them.',
    uniqueItems: true,
    format: 'thang-components-array'
  }, ThangComponentSchema)
});

LevelSystemSchema = c.object({
  title: 'System',
  description: 'Configuration for a System that this Level uses.',
  format: 'level-system',
  required: ['original', 'majorVersion'],
  'default': {
    majorVersion: 0,
    config: {}
  },
  links: [
    {
      rel: 'db',
      href: '/db/level.system/{(original)}/version/{(majorVersion)}'
    }
  ]
}, {
  original: c.objectId({
    title: 'Original',
    description: 'A reference to the original System being configured.',
    format: 'hidden'
  }),
  config: c.object({
    title: 'Configuration',
    description: 'System-specific configuration properties.',
    additionalProperties: true,
    format: 'level-system-configuration'
  }),
  majorVersion: {
    title: 'Major Version',
    description: 'Which major version of the System is being used.',
    type: 'integer',
    minimum: 0,
    format: 'hidden'
  }
});

GeneralArticleSchema = c.object({
  title: 'Article',
  description: 'Reference to a general documentation article.',
  required: ['original'],
  format: 'latest-version-reference',
  'default': {
    original: null,
    majorVersion: 0
  },
  links: [
    {
      rel: 'db',
      href: '/db/article/{(original)}/version/{(majorVersion)}'
    }
  ]
}, {
  original: c.objectId({
    title: 'Original',
    description: 'A reference to the original Article.'
  }),
  majorVersion: {
    title: 'Major Version',
    description: 'Which major version of the Article is being used.',
    type: 'integer',
    minimum: 0
  }
});

LevelSchema = c.object({
  title: 'Level',
  description: 'A spectacular level which will delight and educate its stalwart players with the sorcery of coding.',
  required: ['name'],
  'default': {
    name: 'Ineffable Wizardry',
    description: 'This level is indescribably flarmy.',
    tasks: (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = defaultTasks.length; i < len; i++) {
        t = defaultTasks[i];
        results.push({
          name: t,
          complete: false
        });
      }
      return results;
    })(),
    documentation: {},
    scripts: [],
    thangs: [],
    systems: [],
    victory: {},
    type: 'hero',
    goals: [
      {
        id: 'ogres-die',
        name: 'Defeat the ogres.',
        killThangs: ['ogres'],
        worldEndsAfter: 3
      }, {
        id: 'humans-survive',
        name: 'Your hero must survive.',
        saveThangs: ['Hero Placeholder'],
        howMany: 1,
        worldEndsAfter: 3,
        hiddenGoal: true
      }
    ],
    concepts: ['basic_syntax']
  }
});

c.extendNamedProperties(LevelSchema);

_.extend(LevelSchema.properties, {
  description: {
    title: 'Description',
    description: 'A short explanation of what this level is about.',
    type: 'string',
    maxLength: 65536,
    format: 'markdown'
  },
  studentPlayInstructions: {
    title: 'Student Play Instructions',
    description: 'Instructions for game dev levels when students play them.',
    type: 'string',
    maxLength: 65536,
    format: 'markdown'
  },
  loadingTip: {
    type: 'string',
    title: 'Loading Tip',
    description: 'What to show for this level while it\'s loading.'
  },
  documentation: c.object({
    title: 'Documentation',
    description: 'Documentation articles relating to this level.',
    'default': {
      specificArticles: [],
      generalArticles: []
    }
  }, {
    specificArticles: c.array({
      title: 'Specific Articles',
      description: 'Specific documentation articles that live only in this level.',
      uniqueItems: true
    }, SpecificArticleSchema),
    generalArticles: c.array({
      title: 'General Articles',
      description: 'General documentation articles that can be linked from multiple levels.',
      uniqueItems: true
    }, GeneralArticleSchema),
    hints: c.array({
      title: 'Hints',
      description: 'Tips and tricks to help unstick a player for the level.',
      uniqueItems: true
    }, {
      type: 'object',
      properties: {
        body: {
          type: 'string',
          title: 'Content',
          description: 'The body content of the article, in Markdown.',
          format: 'markdown'
        },
        i18n: {
          type: 'object',
          format: 'i18n',
          props: ['body'],
          description: 'Help translate this hint'
        }
      }
    }),
    hintsB: c.array({
      title: 'HintsB',
      description: '2nd style of hints for a/b testing significant variations',
      uniqueItems: true
    }, {
      type: 'object',
      properties: {
        body: {
          type: 'string',
          title: 'Content',
          description: 'The body content of the article, in Markdown.',
          format: 'markdown'
        },
        i18n: {
          type: 'object',
          format: 'i18n',
          props: ['body'],
          description: 'Help translate this hint'
        }
      }
    })
  }),
  background: c.objectId({
    format: 'hidden'
  }),
  nextLevel: {
    type: 'object',
    links: [
      {
        rel: 'extra',
        href: '/db/level/{($)}'
      }, {
        rel: 'db',
        href: '/db/level/{(original)}/version/{(majorVersion)}'
      }
    ],
    format: 'latest-version-reference',
    title: 'Next Level',
    description: 'Reference to the next level players will play after beating this one.'
  },
  employerDescription: {
    type: 'string',
    format: 'markdown',
    title: 'Employer Description'
  },
  scripts: c.array({
    title: 'Scripts',
    description: 'An array of scripts that trigger based on what the player does and affect things outside of the core level simulation.'
  }, ScriptSchema),
  thangs: c.array({
    title: 'Thangs',
    description: 'An array of Thangs that make up the level.'
  }, LevelThangSchema),
  systems: c.array({
    title: 'Systems',
    description: 'Levels are configured by changing the Systems attached to them.',
    uniqueItems: true
  }, LevelSystemSchema),
  victory: c.object({
    title: 'Victory Screen'
  }, {
    body: {
      type: 'string',
      format: 'markdown',
      title: 'Body Text',
      description: 'Inserted into the Victory Modal once this level is complete. Tell the player they did a good job and what they accomplished!'
    },
    i18n: {
      type: 'object',
      format: 'i18n',
      props: ['body'],
      description: 'Help translate this victory message'
    }
  }),
  i18n: {
    type: 'object',
    format: 'i18n',
    props: ['name', 'description', 'loadingTip', 'studentPlayInstructions'],
    description: 'Help translate this level'
  },
  icon: {
    type: 'string',
    format: 'image-file',
    title: 'Icon'
  },
  banner: {
    type: 'string',
    format: 'image-file',
    title: 'Banner'
  },
  goals: c.array({
    title: 'Goals',
    description: 'An array of goals which are visible to the player and can trigger scripts.'
  }, GoalSchema),
  type: c.shortString({
    title: 'Type',
    description: 'What kind of level this is.',
    'enum': ['campaign', 'ladder', 'ladder-tutorial', 'hero', 'hero-ladder', 'hero-coop', 'course', 'course-ladder', 'game-dev', 'web-dev']
  }),
  terrain: c.terrainString,
  showsGuide: c.shortString({
    title: 'Shows Guide',
    description: 'If the guide is shown at the beginning of the level.',
    'enum': ['first-time', 'always']
  }),
  requiresSubscription: {
    title: 'Requires Subscription',
    description: 'Whether this level is available to subscribers only.',
    type: 'boolean'
  },
  tasks: c.array({
    title: 'Tasks',
    description: 'Tasks to be completed for this level.',
    "default": (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = defaultTasks.length; i < len; i++) {
        t = defaultTasks[i];
        results.push({
          name: t
        });
      }
      return results;
    })()
  }, c.task),
  helpVideos: c.array({
    title: 'Help Videos'
  }, c.object({
    "default": {
      style: 'eccentric',
      url: '',
      free: false
    }
  }, {
    style: c.shortString({
      title: 'Style',
      description: 'Like: original, eccentric, scripted, edited, etc.'
    }),
    free: {
      type: 'boolean',
      title: 'Free',
      description: 'Whether this video is freely available to all players without a subscription.'
    },
    url: c.url({
      title: 'URL',
      description: 'Link to the video on Vimeo.'
    })
  })),
  replayable: {
    type: 'boolean',
    title: 'Replayable',
    description: 'Whether this (hero) level infinitely scales up its difficulty and can be beaten over and over for greater rewards.'
  },
  buildTime: {
    type: 'number',
    description: 'How long it has taken to build this level.'
  },
  practice: {
    type: 'boolean'
  },
  practiceThresholdMinutes: {
    type: 'number',
    description: 'Players with larger playtimes may be directed to a practice level.'
  },
  primerLanguage: {
    type: 'string',
    "enum": ['javascript', 'python'],
    description: 'Programming language taught by this level.'
  },
  shareable: {
    title: 'Shareable',
    type: ['string', 'boolean'],
    "enum": [false, true, 'project'],
    description: 'Whether the level is not shareable, shareable, or a sharing-encouraged project level.'
  },
  adventurer: {
    type: 'boolean'
  },
  adminOnly: {
    type: 'boolean'
  },
  disableSpaces: {
    type: ['boolean', 'integer']
  },
  hidesSubmitUntilRun: {
    type: 'boolean'
  },
  hidesPlayButton: {
    type: 'boolean'
  },
  hidesRunShortcut: {
    type: 'boolean'
  },
  hidesHUD: {
    type: 'boolean'
  },
  hidesSay: {
    type: 'boolean'
  },
  hidesCodeToolbar: {
    type: 'boolean'
  },
  hidesRealTimePlayback: {
    type: 'boolean'
  },
  backspaceThrottle: {
    type: 'boolean'
  },
  lockDefaultCode: {
    type: ['boolean', 'integer']
  },
  moveRightLoopSnippet: {
    type: 'boolean'
  },
  realTimeSpeedFactor: {
    type: 'number'
  },
  autocompleteFontSizePx: {
    type: 'number'
  },
  requiredCode: c.array({}, {
    type: 'string'
  }),
  suspectCode: c.array({}, {
    type: 'object',
    properties: {
      name: {
        type: 'string'
      },
      pattern: {
        type: 'string'
      }
    }
  }),
  requiredGear: {
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: {
        type: 'string',
        links: [
          {
            rel: 'db',
            href: '/db/thang.type/{($)}/version'
          }
        ],
        format: 'latest-version-original-reference'
      }
    }
  },
  restrictedGear: {
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: {
        type: 'string',
        links: [
          {
            rel: 'db',
            href: '/db/thang.type/{($)}/version'
          }
        ],
        format: 'latest-version-original-reference'
      }
    }
  },
  allowedHeroes: {
    type: 'array',
    items: {
      type: 'string',
      links: [
        {
          rel: 'db',
          href: '/db/thang.type/{($)}/version'
        }
      ],
      format: 'latest-version-original-reference'
    }
  },
  campaign: c.shortString({
    title: 'Campaign',
    description: 'Which campaign this level is part of (like "desert").',
    format: 'hidden'
  }),
  campaignIndex: c.int({
    title: 'Campaign Index',
    description: 'The 0-based index of this level in its campaign.',
    format: 'hidden'
  }),
  scoreTypes: c.array({
    title: 'Score Types',
    description: 'What metric to show leaderboards for.',
    uniqueItems: true
  }, c.shortString({
    title: 'Score Type',
    'enum': ['time', 'damage-taken', 'damage-dealt', 'gold-collected', 'difficulty']
  })),
  concepts: c.array({
    title: 'Programming Concepts',
    description: 'Which programming concepts this level covers.',
    uniqueItems: true
  }, c.concept),
  picoCTFProblem: {
    type: 'string',
    description: 'Associated picoCTF problem ID, if this is a picoCTF level'
  }
});

c.extendBasicProperties(LevelSchema, 'level');

c.extendSearchableProperties(LevelSchema);

c.extendVersionedProperties(LevelSchema, 'level');

c.extendPermissionsProperties(LevelSchema, 'level');

c.extendPatchableProperties(LevelSchema);

c.extendTranslationCoverageProperties(LevelSchema);

module.exports = LevelSchema;
});

;require.register("schemas/models/level_component", function(exports, require, module) {
var DependencySchema, LevelComponentSchema, PropertyDocumentationSchema, attackSelfCode, c, metaschema, systems;

c = require('./../schemas');

metaschema = require('./../metaschema');

attackSelfCode = "class AttacksSelf extends Component\n  @className: 'AttacksSelf'\n  chooseAction: ->\n    @attack @";

systems = ['action', 'ai', 'alliance', 'collision', 'combat', 'display', 'event', 'existence', 'hearing', 'inventory', 'movement', 'programming', 'targeting', 'ui', 'vision', 'misc', 'physics', 'effect', 'magic', 'game'];

PropertyDocumentationSchema = c.object({
  title: 'Property Documentation',
  description: 'Documentation entry for a property this Component will add to its Thang which other Components might want to also use.',
  "default": {
    name: 'foo',
    type: 'object',
    description: 'The `foo` property can satisfy all the #{spriteName}\'s foobar needs. Use it wisely.'
  },
  required: ['name', 'type', 'description']
}, {
  name: {
    type: 'string',
    title: 'Name',
    description: 'Name of the property.'
  },
  i18n: {
    type: 'object',
    format: 'i18n',
    props: ['name', 'description', 'context'],
    description: 'Help translate this property'
  },
  context: {
    type: 'object',
    title: 'Example template context',
    additionalProperties: {
      type: 'string'
    }
  },
  codeLanguages: c.array({
    title: 'Specific Code Languages',
    description: 'If present, then only the languages specified will show this documentation. Leave unset for language-independent documentation.',
    format: 'code-languages-array'
  }, c.shortString({
    title: 'Code Language',
    description: 'A specific code language to show this documentation for.',
    format: 'code-language'
  })),
  type: c.shortString({
    title: 'Type',
    description: 'Intended type of the property.'
  }),
  description: {
    oneOf: [
      {
        type: 'object',
        title: 'Language Descriptions',
        description: 'Property descriptions by code language.',
        additionalProperties: {
          type: 'string',
          description: 'Description of the property.',
          maxLength: 1000,
          format: 'markdown'
        },
        format: 'code-languages-object',
        "default": {
          javascript: ''
        }
      }, {
        title: 'Description',
        type: 'string',
        description: 'Description of the property.',
        maxLength: 1000,
        format: 'markdown'
      }
    ]
  },
  args: c.array({
    title: 'Arguments',
    description: 'If this property has type "function", then provide documentation for any function arguments.'
  }, c.FunctionArgumentSchema),
  owner: {
    title: 'Owner',
    type: 'string',
    description: 'Owner of the property, like "this" or "Math".'
  },
  example: {
    oneOf: [
      {
        type: 'object',
        title: 'Language Examples',
        description: 'Examples by code language.',
        additionalProperties: {
          type: 'string',
          description: 'An example code block.',
          format: 'code'
        },
        format: 'code-languages-object',
        "default": {
          javascript: ''
        }
      }, {
        title: 'Example',
        type: 'string',
        description: 'An optional example code block.',
        format: 'javascript'
      }
    ]
  },
  snippets: {
    type: 'object',
    title: 'Snippets',
    description: 'List of snippets for the respective programming languages',
    additionalProperties: c.codeSnippet,
    format: 'code-languages-object'
  },
  returns: c.object({
    title: 'Return Value',
    description: 'Optional documentation of any return value.',
    required: ['type'],
    "default": {
      type: 'null'
    }
  }, {
    type: c.shortString({
      title: 'Type',
      description: 'Type of the return value'
    }),
    example: {
      oneOf: [
        {
          type: 'object',
          title: 'Language Examples',
          description: 'Example return values by code language.',
          additionalProperties: c.shortString({
            description: 'Example return value.',
            format: 'code'
          }),
          format: 'code-languages-object',
          "default": {
            javascript: ''
          }
        }, c.shortString({
          title: 'Example',
          description: 'Example return value'
        })
      ]
    },
    description: {
      oneOf: [
        {
          type: 'object',
          title: 'Language Descriptions',
          description: 'Example return values by code language.',
          additionalProperties: {
            type: 'string',
            description: 'Description of the return value.',
            maxLength: 1000
          },
          format: 'code-languages-object',
          "default": {
            javascript: ''
          }
        }, {
          title: 'Description',
          type: 'string',
          description: 'Description of the return value.',
          maxLength: 1000
        }
      ]
    },
    i18n: {
      type: 'object',
      format: 'i18n',
      props: ['description'],
      description: 'Help translate this return value'
    }
  }),
  autoCompletePriority: {
    type: 'number',
    title: 'Autocomplete Priority',
    description: 'How important this property is to autocomplete.',
    minimum: 0,
    "default": 1.0
  },
  userShouldCaptureReturn: {
    type: 'object',
    title: 'User Should Capture Return',
    properties: {
      variableName: {
        type: 'string',
        title: 'Variable Name',
        description: 'Variable name this property is autocompleted into.',
        "default": 'result'
      }
    }
  }
});

DependencySchema = c.object({
  title: 'Component Dependency',
  description: 'A Component upon which this Component depends.',
  required: ['original', 'majorVersion'],
  format: 'latest-version-reference',
  links: [
    {
      rel: 'db',
      href: '/db/level.component/{(original)}/version/{(majorVersion)}'
    }
  ]
}, {
  original: c.objectId({
    title: 'Original',
    description: 'A reference to another Component upon which this Component depends.'
  }),
  majorVersion: {
    title: 'Major Version',
    description: 'Which major version of the Component this Component needs.',
    type: 'integer',
    minimum: 0
  }
});

LevelComponentSchema = c.object({
  title: 'Component',
  description: 'A Component which can affect Thang behavior.',
  required: ['system', 'name', 'code'],
  "default": {
    system: 'ai',
    name: 'AttacksSelf',
    description: 'This Component makes the Thang attack itself.',
    code: attackSelfCode,
    codeLanguage: 'coffeescript',
    dependencies: [],
    propertyDocumentation: [],
    configSchema: {}
  }
});

c.extendNamedProperties(LevelComponentSchema);

LevelComponentSchema.properties.name.pattern = c.classNamePattern;

_.extend(LevelComponentSchema.properties, {
  system: {
    title: 'System',
    description: 'The short name of the System this Component belongs to, like \"ai\".',
    type: 'string',
    'enum': systems
  },
  description: {
    title: 'Description',
    description: 'A short explanation of what this Component does.',
    type: 'string',
    maxLength: 2000
  },
  codeLanguage: {
    type: 'string',
    title: 'Language',
    description: 'Which programming language this Component is written in.',
    'enum': ['coffeescript']
  },
  code: {
    title: 'Code',
    description: 'The code for this Component, as a CoffeeScript class. TODO: add link to documentation for how to write these.',
    type: 'string',
    format: 'coffee'
  },
  js: {
    title: 'JavaScript',
    description: 'The transpiled JavaScript code for this Component',
    type: 'string',
    format: 'hidden'
  },
  dependencies: c.array({
    title: 'Dependencies',
    description: 'An array of Components upon which this Component depends.',
    uniqueItems: true
  }, DependencySchema),
  propertyDocumentation: c.array({
    title: 'Property Documentation',
    description: 'An array of documentation entries for each notable property this Component will add to its Thang which other Components might want to also use.'
  }, PropertyDocumentationSchema),
  configSchema: _.extend(metaschema, {
    title: 'Configuration Schema',
    description: 'A schema for validating the arguments that can be passed to this Component as configuration.',
    "default": {
      type: 'object'
    }
  }),
  official: {
    type: 'boolean',
    title: 'Official',
    description: 'Whether this is an official CodeCombat Component.'
  },
  searchStrings: {
    type: 'string'
  }
});

c.extendBasicProperties(LevelComponentSchema, 'level.component');

c.extendSearchableProperties(LevelComponentSchema);

c.extendVersionedProperties(LevelComponentSchema, 'level.component');

c.extendPermissionsProperties(LevelComponentSchema, 'level.component');

c.extendPatchableProperties(LevelComponentSchema);

c.extendTranslationCoverageProperties(LevelComponentSchema);

module.exports = LevelComponentSchema;
});

;require.register("schemas/models/level_feedback", function(exports, require, module) {
var LevelFeedbackLevelSchema, LevelFeedbackSchema, c;

c = require('./../schemas');

LevelFeedbackLevelSchema = c.object({
  required: ['original', 'majorVersion']
}, {
  original: c.objectId({}),
  majorVersion: {
    type: 'integer',
    minimum: 0
  }
});

LevelFeedbackSchema = c.object({
  title: 'Feedback',
  description: 'Feedback on a level.'
});

_.extend(LevelFeedbackSchema.properties, {
  creatorName: {
    type: 'string'
  },
  levelName: {
    type: 'string'
  },
  levelID: {
    type: 'string'
  },
  creator: c.objectId({
    links: [
      {
        rel: 'extra',
        href: '/db/user/{($)}'
      }
    ]
  }),
  created: c.date({
    title: 'Created',
    readOnly: true
  }),
  level: LevelFeedbackLevelSchema,
  rating: {
    type: 'number',
    minimum: 1,
    maximum: 5
  },
  review: {
    type: 'string'
  }
});

c.extendBasicProperties(LevelFeedbackSchema, 'level.feedback');

module.exports = LevelFeedbackSchema;
});

;require.register("schemas/models/level_session", function(exports, require, module) {
var LevelSessionLevelSchema, LevelSessionPlayerSchema, LevelSessionSchema, c;

c = require('./../schemas');

LevelSessionPlayerSchema = c.object({
  id: c.objectId({
    links: [
      {
        rel: 'extra',
        href: '/db/user/{($)}'
      }
    ]
  }),
  time: {
    type: 'Number'
  },
  changes: {
    type: 'Number'
  }
});

LevelSessionLevelSchema = c.object({
  required: ['original', 'majorVersion'],
  links: [
    {
      rel: 'db',
      href: '/db/level/{(original)}/version/{(majorVersion)}'
    }
  ]
}, {
  original: c.objectId({}),
  majorVersion: {
    type: 'integer',
    minimum: 0
  }
});

LevelSessionSchema = c.object({
  title: 'Session',
  description: 'A single session for a given level.',
  "default": {
    codeLanguage: 'python',
    submittedCodeLanguage: 'python',
    playtime: 0
  }
});

_.extend(LevelSessionSchema.properties, {
  browser: {
    type: 'object'
  },
  creatorName: {
    type: 'string'
  },
  levelName: {
    type: 'string'
  },
  levelID: {
    type: 'string'
  },
  creator: c.objectId({
    links: [
      {
        rel: 'extra',
        href: '/db/user/{($)}'
      }
    ]
  }),
  created: c.date({
    title: 'Created',
    readOnly: true
  }),
  changed: c.date({
    title: 'Changed',
    readOnly: true
  }),
  dateFirstCompleted: {},
  team: c.shortString(),
  level: LevelSessionLevelSchema,
  heroConfig: c.HeroConfigSchema,
  state: c.object({}, {
    complete: {
      type: 'boolean'
    },
    scripts: c.object({}, {
      ended: {
        type: 'object',
        additionalProperties: {
          type: 'number'
        }
      },
      currentScript: {
        type: ['null', 'string']
      },
      currentScriptOffset: {
        type: 'number'
      }
    }),
    selected: {
      type: ['null', 'string']
    },
    playing: {
      type: 'boolean'
    },
    frame: {
      type: 'number'
    },
    thangs: {
      type: 'object',
      additionalProperties: {
        title: 'Thang',
        type: 'object',
        properties: {
          methods: {
            type: 'object',
            additionalProperties: {
              title: 'Thang Method',
              type: 'object',
              properties: {
                metrics: {
                  type: 'object'
                },
                source: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    },
    goalStates: {
      type: 'object',
      description: 'Maps Goal ID on a goal state object',
      additionalProperties: {
        title: 'Goal State',
        type: 'object',
        properties: {
          status: {
            "enum": ['failure', 'incomplete', 'success']
          }
        }
      }
    },
    submissionCount: {
      description: 'How many times the session has been submitted for real-time playback (can affect the random seed).',
      type: 'integer',
      minimum: 0
    },
    difficulty: {
      description: 'The highest difficulty level beaten, for use in increasing-difficulty replayable levels.',
      type: 'integer',
      minimum: 0
    },
    lastUnsuccessfulSubmissionTime: c.date({
      description: 'The last time that real-time submission was started without resulting in a win.'
    }),
    flagHistory: {
      description: 'The history of flag events during the last real-time playback submission.',
      type: 'array',
      items: c.object({
        required: ['player', 'color', 'time', 'active']
      }, {
        player: {
          type: 'string'
        },
        team: {
          type: 'string'
        },
        color: {
          type: 'string',
          "enum": ['green', 'black', 'violet']
        },
        time: {
          type: 'number',
          minimum: 0
        },
        active: {
          type: 'boolean'
        },
        pos: c.object({
          required: ['x', 'y']
        }, {
          x: {
            type: 'number'
          },
          y: {
            type: 'number'
          }
        }),
        source: {
          type: 'string',
          "enum": ['click']
        }
      })
    },
    topScores: c.array({}, c.object({}, {
      type: c.shortString({
        'enum': ['time', 'damage-taken', 'damage-dealt', 'gold-collected', 'difficulty']
      }),
      date: c.date({
        description: 'When the submission achieving this score happened.'
      }),
      score: {
        type: 'number'
      }
    }))
  }),
  code: {
    type: 'object',
    additionalProperties: {
      type: 'object',
      additionalProperties: {
        type: 'string',
        format: 'code'
      }
    }
  },
  codeLogs: {
    type: 'array'
  },
  codeLanguage: {
    type: 'string'
  },
  playtime: {
    type: 'number',
    title: 'Playtime',
    description: 'The total playtime on this session in seconds'
  },
  teamSpells: {
    type: 'object',
    additionalProperties: {
      type: 'array'
    }
  },
  players: {
    type: 'object'
  },
  chat: {
    type: 'array'
  },
  ladderAchievementDifficulty: {
    type: 'integer',
    minimum: 0,
    description: 'What ogre AI difficulty, 0-4, this human session has beaten in a multiplayer arena.'
  },
  meanStrength: {
    type: 'number'
  },
  standardDeviation: {
    type: 'number',
    minimum: 0
  },
  totalScore: {
    type: 'number'
  },
  submitted: {
    type: 'boolean'
  },
  submitDate: c.date({
    title: 'Submitted'
  }),
  submittedCode: {
    type: 'object',
    additionalProperties: {
      type: 'object',
      additionalProperties: {
        type: 'string',
        format: 'code'
      }
    }
  },
  submittedCodeLanguage: {
    type: 'string'
  },
  isRanking: {
    type: 'boolean',
    description: 'Whether this session is still in the first ranking chain after being submitted.'
  },
  randomSimulationIndex: {
    type: 'number',
    description: 'A random updated every time the game is randomly simulated for a uniform random distribution of simulations (see #2448).',
    minimum: 0,
    maximum: 1
  },
  unsubscribed: {
    type: 'boolean',
    description: 'Whether the player has opted out of receiving email updates about ladder rankings for this session.'
  },
  numberOfWinsAndTies: {
    type: 'number'
  },
  numberOfLosses: {
    type: 'number'
  },
  scoreHistory: {
    type: 'array',
    title: 'Score History',
    description: 'A list of objects representing the score history of a session',
    items: {
      title: 'Score History Point',
      description: 'An array with the format [unix timestamp, totalScore]',
      type: 'array',
      items: {
        type: 'number'
      }
    }
  },
  matches: {
    type: 'array',
    title: 'Matches',
    description: 'All of the matches a submitted session has played in its current state.',
    items: {
      type: 'object',
      properties: {
        date: c.date({
          title: 'Date computed',
          description: 'The date a match was computed.'
        }),
        playtime: {
          title: 'Playtime so far',
          description: 'The total seconds of playtime on this session when the match was computed. Not currently tracked.',
          type: 'number'
        },
        metrics: {
          type: 'object',
          title: 'Metrics',
          description: 'Various information about the outcome of a match.',
          properties: {
            rank: {
              title: 'Rank',
              description: 'A 0-indexed ranking representing the player\'s standing in the outcome of a match',
              type: 'number'
            }
          }
        },
        opponents: {
          type: 'array',
          title: 'Opponents',
          description: 'An array containing information about the opponents\' sessions in a given match.',
          items: {
            type: 'object',
            properties: {
              sessionID: {
                title: 'Opponent Session ID',
                description: 'The session ID of an opponent.',
                type: ['object', 'string', 'null']
              },
              userID: {
                title: 'Opponent User ID',
                description: 'The user ID of an opponent',
                type: ['object', 'string', 'null']
              },
              name: {
                title: 'Opponent name',
                description: 'The name of the opponent',
                type: ['string', 'null']
              },
              totalScore: {
                title: 'Opponent total score',
                description: 'The totalScore of a user when the match was computed',
                type: ['number', 'string', 'null']
              },
              metrics: {
                type: 'object',
                properties: {
                  rank: {
                    title: 'Opponent Rank',
                    description: 'The opponent\'s ranking in a given match',
                    type: 'number'
                  }
                }
              },
              codeLanguage: {
                type: ['string', 'null'],
                description: 'What submittedCodeLanguage the opponent used during the match'
              }
            }
          }
        },
        simulator: {
          type: 'object',
          description: 'Holds info on who simulated the match, and with what tools.'
        },
        randomSeed: {
          description: 'Stores the random seed that was used during this match.'
        }
      }
    }
  },
  leagues: c.array({
    description: 'Multiplayer data for the league corresponding to Clans and CourseInstances the player is a part of.'
  }, c.object({}, {
    leagueID: {
      type: 'string',
      description: 'The _id of a Clan or CourseInstance the user belongs to.'
    },
    stats: c.object({
      description: 'Multiplayer match statistics corresponding to this entry in the league.'
    }),
    lastOpponentSubmitDate: c.date({
      description: 'The submitDate of the last league session we selected to play against (for playing through league opponents in order).'
    })
  }))
});

LevelSessionSchema.properties.leagues.items.properties.stats.properties = _.pick(LevelSessionSchema.properties, 'meanStrength', 'standardDeviation', 'totalScore', 'numberOfWinsAndTies', 'numberOfLosses', 'scoreHistory', 'matches');

c.extendBasicProperties(LevelSessionSchema, 'level.session');

c.extendPermissionsProperties(LevelSessionSchema, 'level.session');

module.exports = LevelSessionSchema;
});

;require.register("schemas/models/level_system", function(exports, require, module) {
var DependencySchema, LevelSystemSchema, c, jitterSystemCode, metaschema;

c = require('./../schemas');

metaschema = require('./../metaschema');

jitterSystemCode = "class Jitter extends System\n  constructor: (world, config) ->\n    super world, config\n    @idlers = @addRegistry (thang) -> thang.exists and thang.acts and thang.moves and thang.action is 'idle'\n\n  update: ->\n    # We return a simple numeric hash that will combine to a frame hash\n    # help us determine whether this frame has changed in resimulations.\n    hash = 0\n    for thang in @idlers\n      hash += thang.pos.x += 0.5 - Math.random()\n      hash += thang.pos.y += 0.5 - Math.random()\n      thang.hasMoved = true\n    return hash";

DependencySchema = c.object({
  title: 'System Dependency',
  description: 'A System upon which this System depends.',
  required: ['original', 'majorVersion'],
  format: 'latest-version-reference',
  links: [
    {
      rel: 'db',
      href: '/db/level.system/{(original)}/version/{(majorVersion)}'
    }
  ]
}, {
  original: c.objectId({
    title: 'Original',
    description: 'A reference to another System upon which this System depends.'
  }),
  majorVersion: {
    title: 'Major Version',
    description: 'Which major version of the System this System needs.',
    type: 'integer',
    minimum: 0
  }
});

LevelSystemSchema = c.object({
  title: 'System',
  description: 'A System which can affect Level behavior.',
  required: ['name', 'code'],
  "default": {
    name: 'JitterSystem',
    description: 'This System makes all idle, movable Thangs jitter around.',
    code: jitterSystemCode,
    codeLanguage: 'coffeescript',
    dependencies: [],
    configSchema: {}
  }
});

c.extendNamedProperties(LevelSystemSchema);

LevelSystemSchema.properties.name.pattern = c.classNamePattern;

_.extend(LevelSystemSchema.properties, {
  description: {
    title: 'Description',
    description: 'A short explanation of what this System does.',
    type: 'string',
    maxLength: 2000
  },
  codeLanguage: {
    type: 'string',
    title: 'Language',
    description: 'Which programming language this System is written in.',
    'enum': ['coffeescript']
  },
  code: {
    title: 'Code',
    description: 'The code for this System, as a CoffeeScript class. TODO: add link to documentation for how to write these.',
    type: 'string',
    format: 'coffee'
  },
  js: {
    title: 'JavaScript',
    description: 'The transpiled JavaScript code for this System',
    type: 'string',
    format: 'hidden'
  },
  dependencies: c.array({
    title: 'Dependencies',
    description: 'An array of Systems upon which this System depends.',
    uniqueItems: true
  }, DependencySchema),
  configSchema: _.extend(metaschema, {
    title: 'Configuration Schema',
    description: 'A schema for validating the arguments that can be passed to this System as configuration.',
    "default": {
      type: 'object',
      additionalProperties: false
    }
  }),
  official: {
    type: 'boolean',
    title: 'Official',
    description: 'Whether this is an official CodeCombat System.'
  }
});

c.extendBasicProperties(LevelSystemSchema, 'level.system');

c.extendSearchableProperties(LevelSystemSchema);

c.extendVersionedProperties(LevelSystemSchema, 'level.system');

c.extendPermissionsProperties(LevelSystemSchema);

c.extendPatchableProperties(LevelSystemSchema);

module.exports = LevelSystemSchema;
});

;require.register("schemas/models/mail_sent", function(exports, require, module) {
var MailSentSchema, c;

c = require('./../schemas');

MailSentSchema = c.object({
  title: 'Sent mail',
  description: 'Emails which have been sent through the system'
});

_.extend(MailSentSchema.properties, {
  mailTask: c.objectId({}),
  user: c.objectId({
    links: [
      {
        rel: 'extra',
        href: '/db/user/{($)}'
      }
    ]
  }),
  sent: c.date({
    title: 'Sent',
    readOnly: true
  }),
  metadata: c.object({}, {})
});

c.extendBasicProperties(MailSentSchema, 'mail.sent');

module.exports = MailSentSchema;
});

;require.register("schemas/models/mandate.schema", function(exports, require, module) {
var MandateSchema, c;

c = require('./../schemas');

module.exports = MandateSchema = {
  type: 'object',
  additionalProperties: false,
  "default": {
    simulationThroughputRatio: 1,
    sessionSaveDelay: {
      registered: {
        min: 4,
        max: 10
      },
      anonymous: {
        min: 5,
        max: 15
      }
    }
  },
  properties: {
    simulationThroughputRatio: {
      name: 'Simulation Throughput Ratio',
      description: '0-1 fraction of requests for a match to simulate that should be granted.',
      type: 'number',
      minimum: 0,
      maximum: 1
    },
    sessionSaveDelay: {
      name: 'Session Save Delay',
      description: 'How often we save level sessions after code changes--min and max wait in seconds.',
      type: 'object',
      properties: {
        registered: {
          description: 'How often to save for registered players.',
          type: 'object',
          additionalProperties: false,
          requiredProperties: ['min', 'max'],
          properties: {
            min: {
              type: 'number',
              minimum: 1,
              exclusiveMinimum: true,
              format: 'seconds'
            },
            max: {
              type: 'number',
              minimum: 5,
              exclusiveMinimum: true,
              format: 'seconds'
            }
          }
        },
        anonymous: {
          description: 'How often to save for anonymous players.',
          type: 'object',
          additionalProperties: false,
          requiredProperties: ['min', 'max'],
          properties: {
            min: {
              type: 'number',
              minimum: 1,
              exclusiveMinimum: true,
              format: 'seconds'
            },
            max: {
              type: 'number',
              minimum: 5,
              exclusiveMinimum: true,
              format: 'seconds'
            }
          }
        }
      }
    }
  }
};

c.extendBasicProperties(MandateSchema, 'Mandate');
});

;require.register("schemas/models/o-auth-provider.schema", function(exports, require, module) {
var OAuthProviderSchema, c;

c = require('./../schemas');

OAuthProviderSchema = {
  description: 'A service which provides OAuth identification, login for our users.',
  type: 'object',
  properties: {
    lookupUrlTemplate: {
      type: 'string',
      description: 'A template of the URL for the user resource. Should include "<%= accessToken %>" for string interpolation.'
    },
    tokenUrl: {
      type: 'string'
    },
    authorizeUrl: {
      type: 'string'
    },
    clientID: {
      type: 'string'
    }
  }
};

c.extendBasicProperties(OAuthProviderSchema, 'OAuthProvider');

c.extendNamedProperties(OAuthProviderSchema, 'OAuthProvider');

module.exports = OAuthProviderSchema;
});

;require.register("schemas/models/patch", function(exports, require, module) {
var PatchSchema, c, patchables;

c = require('./../schemas');

patchables = ['achievement', 'article', 'campaign', 'course', 'level', 'level_component', 'level_system', 'poll', 'thang_type'];

PatchSchema = c.object({
  title: 'Patch',
  required: ['target', 'delta', 'commitMessage']
}, {
  delta: {
    title: 'Delta',
    type: ['array', 'object']
  },
  commitMessage: c.shortString({
    maxLength: 500,
    minLength: 1
  }),
  creator: c.objectId({
    links: [
      {
        rel: 'extra',
        href: '/db/user/{($)}'
      }
    ]
  }),
  acceptor: c.objectId({
    links: [
      {
        rel: 'extra',
        href: '/db/user/{($)}'
      }
    ]
  }),
  created: c.date({
    title: 'Created',
    readOnly: true
  }),
  status: {
    "enum": ['pending', 'accepted', 'rejected', 'withdrawn']
  },
  target: c.object({
    title: 'Target',
    required: ['collection', 'id']
  }, {
    collection: {
      "enum": patchables
    },
    id: c.objectId({
      title: 'Target ID'
    }),
    original: c.objectId({
      title: 'Target Original'
    }),
    version: {
      properties: {
        major: {
          type: 'number',
          minimum: 0
        },
        minor: {
          type: 'number',
          minimum: 0
        }
      }
    }
  }),
  wasPending: {
    type: 'boolean'
  },
  newlyAccepted: {
    type: 'boolean'
  },
  reasonNotAutoAccepted: {
    type: 'string'
  }
});

c.extendBasicProperties(PatchSchema, 'patch');

module.exports = PatchSchema;
});

;require.register("schemas/models/payment.schema", function(exports, require, module) {
var PaymentSchema, c;

c = require('./../schemas');

PaymentSchema = c.object({
  title: 'Payment',
  required: []
}, {
  purchaser: c.objectId({
    links: [
      {
        rel: 'extra',
        href: '/db/user/{($)}'
      }
    ]
  }),
  recipient: c.objectId({
    links: [
      {
        rel: 'extra',
        href: '/db/user/{($)}'
      }
    ]
  }),
  purchaserEmailLower: c.shortString({
    description: 'We may have a purchaser with no account, in which case only this email will be set'
  }),
  service: {
    "enum": ['stripe', 'ios', 'external']
  },
  amount: {
    type: 'integer',
    description: 'Payment in cents.'
  },
  created: c.date({
    title: 'Created',
    readOnly: true
  }),
  gems: {
    type: 'integer',
    description: 'The number of gems acquired.'
  },
  productID: {
    "enum": ['gems_5', 'gems_10', 'gems_20', 'custom']
  },
  description: {
    type: 'string'
  },
  prepaidID: c.objectId(),
  ios: c.object({
    title: 'iOS IAP Data'
  }, {
    transactionID: {
      type: 'string'
    },
    rawReceipt: {
      type: 'string'
    },
    localPrice: {
      type: 'string'
    }
  }),
  stripe: c.object({
    title: 'Stripe Data'
  }, {
    timestamp: {
      type: 'integer',
      description: 'Unique identifier provided by the client, to guard against duplicate payments.'
    },
    chargeID: {
      type: 'string'
    },
    customerID: {
      type: 'string'
    },
    invoiceID: {
      type: 'string'
    }
  })
});

c.extendBasicProperties(PaymentSchema, 'payment');

module.exports = PaymentSchema;
});

;require.register("schemas/models/poll.schema", function(exports, require, module) {
var PollSchema, c;

c = require('./../schemas');

PollSchema = c.object({
  title: 'Poll'
});

c.extendNamedProperties(PollSchema);

_.extend(PollSchema.properties, {
  description: {
    type: 'string',
    title: 'Description',
    description: 'Optional: extra context or explanation',
    format: 'markdown'
  },
  answers: c.array({
    title: 'Answers'
  }, c.object({
    required: ['key', 'text', 'i18n', 'votes']
  }, {
    key: c.shortString({
      title: 'Key',
      description: 'Key for recording votes, like 14-to-17',
      pattern: '^[a-z0-9-]+$'
    }),
    text: c.shortString({
      title: 'Text',
      description: 'Answer that the player will see, like 14 - 17.',
      format: 'markdown'
    }),
    i18n: {
      type: 'object',
      title: 'i18n',
      format: 'i18n',
      props: ['text']
    },
    votes: {
      title: 'Votes',
      type: 'integer',
      minimum: 0
    }
  })),
  i18n: {
    type: 'object',
    title: 'i18n',
    format: 'i18n',
    props: ['name', 'description']
  },
  created: c.date({
    title: 'Created',
    readOnly: true
  }),
  priority: {
    title: 'Priority',
    description: 'Lower numbers will show earlier.',
    type: 'integer'
  },
  userProperty: c.shortString({
    pattern: c.identifierPattern,
    description: 'Optional: store the answer inside the User object itself, also, with this property name.'
  })
});

c.extendBasicProperties(PollSchema, 'poll');

c.extendSearchableProperties(PollSchema);

c.extendTranslationCoverageProperties(PollSchema);

c.extendPatchableProperties(PollSchema);

module.exports = PollSchema;
});

;require.register("schemas/models/prepaid.schema", function(exports, require, module) {
var PrepaidSchema, c;

c = require('./../schemas');

PrepaidSchema = c.object({
  title: 'Prepaid',
  required: ['type']
}, {
  creator: c.objectId({
    links: [
      {
        rel: 'extra',
        href: '/db/user/{($)}'
      }
    ]
  }),
  clientCreator: c.objectId({
    links: [
      {
        rel: 'extra',
        href: '/db/api-clients/{($)}'
      }
    ]
  }),
  redeemers: c.array({
    title: 'Users who have redeemed this code'
  }, c.object({
    required: ['date', 'userID']
  }, {
    date: c.date({
      title: 'Redeemed date'
    }),
    userID: c.objectId({
      links: [
        {
          rel: 'extra',
          href: '/db/user/{($)}'
        }
      ]
    })
  })),
  maxRedeemers: {
    type: 'integer'
  },
  code: c.shortString({
    title: "Unique code to redeem"
  }),
  type: {
    type: 'string'
  },
  properties: {
    type: 'object'
  },
  exhausted: {
    type: 'boolean'
  },
  startDate: c.stringDate(),
  endDate: c.stringDate()
});

c.extendBasicProperties(PrepaidSchema, 'prepaid');

module.exports = PrepaidSchema;
});

;require.register("schemas/models/product.schema", function(exports, require, module) {
var ProductSchema, c;

c = require('./../schemas');

module.exports = ProductSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: {
      type: 'string'
    },
    amount: {
      type: 'integer',
      description: 'Cost in cents'
    },
    gems: {
      type: 'integer',
      description: 'Number of gems awarded'
    }
  }
};

c.extendBasicProperties(ProductSchema, 'Product');
});

;require.register("schemas/models/purchase.schema", function(exports, require, module) {
var PurchaseSchema, c, purchaseables;

c = require('./../schemas');

purchaseables = ['level', 'thang_type'];

PurchaseSchema = c.object({
  title: 'Purchase',
  required: ['purchaser', 'recipient', 'purchased']
}, {
  purchaser: c.objectId({
    links: [
      {
        rel: 'extra',
        href: '/db/user/{($)}'
      }
    ]
  }),
  recipient: c.objectId({
    links: [
      {
        rel: 'extra',
        href: '/db/user/{($)}'
      }
    ]
  }),
  purchased: c.object({
    title: 'Target',
    required: ['collection', 'original']
  }, {
    collection: {
      "enum": purchaseables
    },
    original: c.objectId({
      title: 'Target Original'
    })
  }),
  created: c.date({
    title: 'Created',
    readOnly: true
  })
});

c.extendBasicProperties(PurchaseSchema, 'patch');

module.exports = PurchaseSchema;
});

;require.register("schemas/models/thang_component", function(exports, require, module) {
var ThangComponentSchema, c;

c = require('./../schemas');

module.exports = ThangComponentSchema = c.object({
  title: 'Component',
  description: 'Configuration for a Component that this Thang uses.',
  format: 'component-reference',
  required: ['original', 'majorVersion'],
  "default": {
    majorVersion: 0,
    config: {}
  },
  links: [
    {
      rel: 'db',
      href: '/db/level.component/{(original)}/version/{(majorVersion)}'
    }
  ]
}, {
  original: c.objectId({
    title: 'Original',
    description: 'A reference to the original Component being configured.',
    format: 'hidden'
  }),
  config: c.object({
    title: 'Configuration',
    description: 'Component-specific configuration properties.',
    additionalProperties: true,
    format: 'thang-component-configuration'
  }),
  majorVersion: {
    title: 'Major Version',
    description: 'Which major version of the Component is being used.',
    type: 'integer',
    minimum: 0,
    format: 'hidden'
  }
});
});

;require.register("schemas/models/thang_type", function(exports, require, module) {
var ActionSchema, ContainerObjectSchema, PositionsSchema, RawAnimationObjectSchema, ShapeObjectSchema, SoundSchema, ThangComponentSchema, ThangTypeSchema, c;

c = require('./../schemas');

ThangComponentSchema = require('./thang_component');

ThangTypeSchema = c.object({
  "default": {
    kind: 'Misc'
  }
});

c.extendNamedProperties(ThangTypeSchema);

ShapeObjectSchema = c.object({
  title: 'Shape'
}, {
  fc: {
    type: 'string',
    title: 'Fill Color'
  },
  lf: {
    type: 'array',
    title: 'Linear Gradient Fill'
  },
  rf: {
    type: 'array',
    title: 'Radial Gradient Fill'
  },
  ls: {
    type: 'array',
    title: 'Linear Gradient Stroke'
  },
  p: {
    type: 'string',
    title: 'Path'
  },
  de: {
    type: 'array',
    title: 'Draw Ellipse'
  },
  sc: {
    type: 'string',
    title: 'Stroke Color'
  },
  ss: {
    type: 'array',
    title: 'Stroke Style'
  },
  t: c.array({}, {
    type: 'number',
    title: 'Transform'
  }),
  m: {
    type: 'string',
    title: 'Mask'
  }
});

ContainerObjectSchema = c.object({
  format: 'container'
}, {
  b: c.array({
    title: 'Bounds'
  }, {
    type: 'number'
  }),
  c: c.array({
    title: 'Children'
  }, {
    anyOf: [
      {
        type: 'string',
        title: 'Shape Child'
      }, c.object({
        title: 'Container Child'
      }), {
        gn: {
          type: 'string',
          title: 'Global Name'
        },
        t: c.array({}, {
          type: 'number'
        })
      }
    ]
  })
});

RawAnimationObjectSchema = c.object({}, {
  bounds: c.array({
    title: 'Bounds'
  }, {
    type: 'number'
  }),
  frameBounds: c.array({
    title: 'Frame Bounds'
  }, c.array({
    title: 'Bounds'
  }, {
    type: 'number'
  })),
  shapes: c.array({}, {
    bn: {
      type: 'string',
      title: 'Block Name'
    },
    gn: {
      type: 'string',
      title: 'Global Name'
    },
    im: {
      type: 'boolean',
      title: 'Is Mask'
    },
    m: {
      type: 'string',
      title: 'Uses Mask'
    }
  }),
  containers: c.array({}, {
    bn: {
      type: 'string',
      title: 'Block Name'
    },
    gn: {
      type: 'string',
      title: 'Global Name'
    },
    t: c.array({}, {
      type: 'number'
    }),
    o: {
      type: 'boolean',
      title: 'Starts Hidden (_off)'
    },
    al: {
      type: 'number',
      title: 'Alpha'
    }
  }),
  animations: c.array({}, {
    bn: {
      type: 'string',
      title: 'Block Name'
    },
    gn: {
      type: 'string',
      title: 'Global Name'
    },
    t: c.array({}, {
      type: 'number',
      title: 'Transform'
    }),
    a: c.array({
      title: 'Arguments'
    })
  }),
  tweens: c.array({}, c.array({
    title: 'Function Chain'
  }, c.object({
    title: 'Function Call'
  }, {
    n: {
      type: 'string',
      title: 'Name'
    },
    a: c.array({
      title: 'Arguments'
    })
  }))),
  graphics: c.array({}, {
    bn: {
      type: 'string',
      title: 'Block Name'
    },
    p: {
      type: 'string',
      title: 'Path'
    }
  })
});

PositionsSchema = c.object({
  title: 'Positions',
  description: 'Customize position offsets.'
}, {
  registration: c.point2d({
    title: 'Registration Point',
    description: 'Action-specific registration point override.'
  }),
  torso: c.point2d({
    title: 'Torso Offset',
    description: 'Action-specific torso offset override.'
  }),
  mouth: c.point2d({
    title: 'Mouth Offset',
    description: 'Action-specific mouth offset override.'
  }),
  aboveHead: c.point2d({
    title: 'Above Head Offset',
    description: 'Action-specific above-head offset override.'
  })
});

ActionSchema = c.object({}, {
  animation: {
    type: 'string',
    description: 'Raw animation being sourced',
    format: 'raw-animation'
  },
  container: {
    type: 'string',
    description: 'Name of the container to show'
  },
  relatedActions: c.object({}, {
    begin: {
      $ref: '#/definitions/action'
    },
    end: {
      $ref: '#/definitions/action'
    },
    main: {
      $ref: '#/definitions/action'
    },
    fore: {
      $ref: '#/definitions/action'
    },
    back: {
      $ref: '#/definitions/action'
    },
    side: {
      $ref: '#/definitions/action'
    },
    '?0?011?11?11': {
      $ref: '#/definitions/action',
      title: 'NW corner'
    },
    '?0?11011?11?': {
      $ref: '#/definitions/action',
      title: 'NE corner, flipped'
    },
    '?0?111111111': {
      $ref: '#/definitions/action',
      title: 'N face'
    },
    '?11011011?0?': {
      $ref: '#/definitions/action',
      title: 'SW corner, top'
    },
    '11?11?110?0?': {
      $ref: '#/definitions/action',
      title: 'SE corner, top, flipped'
    },
    '?11011?0????': {
      $ref: '#/definitions/action',
      title: 'SW corner, bottom'
    },
    '11?110?0????': {
      $ref: '#/definitions/action',
      title: 'SE corner, bottom, flipped'
    },
    '?11011?11?11': {
      $ref: '#/definitions/action',
      title: 'W face'
    },
    '11?11011?11?': {
      $ref: '#/definitions/action',
      title: 'E face, flipped'
    },
    '011111111111': {
      $ref: '#/definitions/action',
      title: 'NW elbow'
    },
    '110111111111': {
      $ref: '#/definitions/action',
      title: 'NE elbow, flipped'
    },
    '111111111?0?': {
      $ref: '#/definitions/action',
      title: 'S face, top'
    },
    '111111?0????': {
      $ref: '#/definitions/action',
      title: 'S face, bottom'
    },
    '111111111011': {
      $ref: '#/definitions/action',
      title: 'SW elbow, top'
    },
    '111111111110': {
      $ref: '#/definitions/action',
      title: 'SE elbow, top, flipped'
    },
    '111111011?11': {
      $ref: '#/definitions/action',
      title: 'SW elbow, bottom'
    },
    '11111111011?': {
      $ref: '#/definitions/action',
      title: 'SE elbow, bottom, flipped'
    },
    '111111111111': {
      $ref: '#/definitions/action',
      title: 'Middle'
    }
  }),
  loops: {
    type: 'boolean'
  },
  speed: {
    type: 'number'
  },
  goesTo: {
    type: 'string',
    description: 'Action (animation?) to which we switch after this animation.'
  },
  frames: {
    type: 'string',
    pattern: '^[0-9,]+$',
    description: 'Manually way to specify frames.'
  },
  framerate: {
    type: 'number',
    description: 'Get this from the HTML output.'
  },
  positions: PositionsSchema,
  scale: {
    title: 'Scale',
    type: 'number'
  },
  flipX: {
    title: 'Flip X',
    type: 'boolean',
    description: 'Flip this animation horizontally?'
  },
  flipY: {
    title: 'Flip Y',
    type: 'boolean',
    description: 'Flip this animation vertically?'
  }
});

SoundSchema = c.sound({
  delay: {
    type: 'number'
  }
});

_.extend(ThangTypeSchema.properties, {
  raw: c.object({
    title: 'Raw Vector Data',
    "default": {
      shapes: {},
      containers: {},
      animations: {}
    }
  }, {
    shapes: c.object({
      title: 'Shapes',
      additionalProperties: ShapeObjectSchema
    }),
    containers: c.object({
      title: 'Containers',
      additionalProperties: ContainerObjectSchema
    }),
    animations: c.object({
      title: 'Animations',
      additionalProperties: RawAnimationObjectSchema
    })
  }),
  kind: c.shortString({
    "enum": ['Unit', 'Floor', 'Wall', 'Doodad', 'Misc', 'Mark', 'Item', 'Hero', 'Missile'],
    "default": 'Misc',
    title: 'Kind'
  }),
  terrains: c.array({
    title: 'Terrains',
    description: 'If specified, limits this ThangType to levels with matching terrains.',
    uniqueItems: true
  }, c.terrainString),
  gems: {
    type: 'integer',
    minimum: 0,
    title: 'Gem Cost',
    description: 'How many gems this item or hero costs.'
  },
  heroClass: {
    type: 'string',
    "enum": ['Warrior', 'Ranger', 'Wizard'],
    title: 'Hero Class',
    description: 'What class this is (if a hero) or is restricted to (if an item). Leave undefined for most items.'
  },
  tier: {
    type: 'number',
    minimum: 0,
    title: 'Tier',
    description: 'What tier (fractional) this item or hero is in.'
  },
  actions: c.object({
    title: 'Actions',
    additionalProperties: {
      $ref: '#/definitions/action'
    }
  }),
  soundTriggers: c.object({
    title: 'Sound Triggers',
    additionalProperties: c.array({}, {
      $ref: '#/definitions/sound'
    })
  }, {
    say: c.object({
      format: 'slug-props',
      additionalProperties: {
        $ref: '#/definitions/sound'
      }
    }, {
      defaultSimlish: c.array({}, {
        $ref: '#/definitions/sound'
      }),
      swearingSimlish: c.array({}, {
        $ref: '#/definitions/sound'
      })
    })
  }),
  rotationType: {
    title: 'Rotation',
    type: 'string',
    "enum": ['isometric', 'fixed', 'free']
  },
  matchWorldDimensions: {
    title: 'Match World Dimensions',
    type: 'boolean'
  },
  shadow: {
    title: 'Shadow Diameter',
    type: 'number',
    format: 'meters',
    description: 'Shadow diameter in meters'
  },
  description: {
    type: 'string',
    format: 'markdown',
    title: 'Description'
  },
  layerPriority: {
    title: 'Layer Priority',
    type: 'integer',
    description: 'Within its layer, sprites are sorted by layer priority, then y, then z.'
  },
  scale: {
    title: 'Scale',
    type: 'number'
  },
  spriteType: {
    "enum": ['singular', 'segmented'],
    title: 'Sprite Type'
  },
  positions: PositionsSchema,
  raster: {
    type: 'string',
    format: 'image-file',
    title: 'Raster Image'
  },
  rasterIcon: {
    type: 'string',
    format: 'image-file',
    title: 'Raster Image Icon'
  },
  containerIcon: {
    type: 'string'
  },
  featureImages: c.object({
    title: 'Hero Doll Images'
  }, {
    body: {
      type: 'string',
      format: 'image-file',
      title: 'Body'
    },
    head: {
      type: 'string',
      format: 'image-file',
      title: 'Head'
    },
    hair: {
      type: 'string',
      format: 'image-file',
      title: 'Hair'
    },
    thumb: {
      type: 'string',
      format: 'image-file',
      title: 'Thumb'
    },
    wizardHand: {
      type: 'string',
      format: 'image-file',
      title: 'Wizard Hand'
    }
  }),
  dollImages: c.object({
    title: 'Paper Doll Images'
  }, {
    male: {
      type: 'string',
      format: 'image-file',
      title: ' Male'
    },
    female: {
      type: 'string',
      format: 'image-file',
      title: ' Female'
    },
    maleThumb: {
      type: 'string',
      format: 'image-file',
      title: 'Thumb (Male)'
    },
    femaleThumb: {
      type: 'string',
      format: 'image-file',
      title: 'Thumb (Female)'
    },
    maleRanger: {
      type: 'string',
      format: 'image-file',
      title: 'Glove (Male Ranger)'
    },
    maleRangerThumb: {
      type: 'string',
      format: 'image-file',
      title: 'Thumb (Male Ranger)'
    },
    femaleRanger: {
      type: 'string',
      format: 'image-file',
      title: 'Glove (Female Ranger)'
    },
    femaleRangerThumb: {
      type: 'string',
      format: 'image-file',
      title: 'Thumb (Female Ranger)'
    },
    maleBack: {
      type: 'string',
      format: 'image-file',
      title: ' Male Back'
    },
    femaleBack: {
      type: 'string',
      format: 'image-file',
      title: ' Female Back'
    }
  }),
  colorGroups: c.object({
    title: 'Color Groups',
    additionalProperties: {
      type: 'array',
      format: 'thang-color-group',
      items: {
        type: 'string'
      }
    }
  }),
  snap: c.object({
    title: 'Snap',
    description: 'In the level editor, snap positioning to these intervals.',
    required: ['x', 'y'],
    "default": {
      x: 4,
      y: 4
    }
  }, {
    x: {
      title: 'Snap X',
      type: 'number',
      description: 'Snap to this many meters in the x-direction.'
    },
    y: {
      title: 'Snap Y',
      type: 'number',
      description: 'Snap to this many meters in the y-direction.'
    }
  }),
  components: c.array({
    title: 'Components',
    description: 'Thangs are configured by changing the Components attached to them.',
    uniqueItems: true,
    format: 'thang-components-array'
  }, ThangComponentSchema),
  i18n: {
    type: 'object',
    format: 'i18n',
    props: ['name', 'description', 'extendedName', 'unlockLevelName'],
    description: 'Help translate this ThangType\'s name and description.'
  },
  extendedName: {
    type: 'string',
    title: 'Extended Hero Name',
    description: 'The long form of the hero\'s name. Ex.: "Captain Anya Weston".'
  },
  unlockLevelName: {
    type: 'string',
    title: 'Unlock Level Name',
    description: 'The name of the level in which the hero is unlocked.'
  },
  tasks: c.array({
    title: 'Tasks',
    description: 'Tasks to be completed for this ThangType.'
  }, c.task),
  prerenderedSpriteSheetData: c.array({
    title: 'Prerendered SpriteSheet Data'
  }, c.object({
    title: 'SpriteSheet'
  }, {
    actionNames: {
      type: 'array'
    },
    animations: {
      type: 'object',
      description: 'Third EaselJS SpriteSheet animations format',
      additionalProperties: {
        description: 'EaselJS animation',
        type: 'object',
        properties: {
          frames: {
            type: 'array'
          },
          next: {
            type: ['string', 'null']
          },
          speed: {
            type: 'number'
          }
        }
      }
    },
    colorConfig: c.object({
      additionalProperties: c.colorConfig()
    }),
    colorLabel: {
      "enum": ['red', 'green', 'blue']
    },
    frames: {
      type: 'array',
      description: 'Second EaselJS SpriteSheet frames format',
      items: {
        type: 'array',
        items: [
          {
            type: 'number',
            title: 'x'
          }, {
            type: 'number',
            title: 'y'
          }, {
            type: 'number',
            title: 'width'
          }, {
            type: 'number',
            title: 'height'
          }, {
            type: 'number',
            title: 'imageIndex'
          }, {
            type: 'number',
            title: 'regX'
          }, {
            type: 'number',
            title: 'regY'
          }
        ]
      }
    },
    image: {
      type: 'string',
      format: 'image-file'
    },
    resolutionFactor: {
      type: 'number'
    },
    spriteType: {
      "enum": ['singular', 'segmented'],
      title: 'Sprite Type'
    }
  }))
});

ThangTypeSchema.required = [];

ThangTypeSchema["default"] = {
  raw: {}
};

ThangTypeSchema.definitions = {
  action: ActionSchema,
  sound: SoundSchema
};

c.extendBasicProperties(ThangTypeSchema, 'thang.type');

c.extendSearchableProperties(ThangTypeSchema);

c.extendVersionedProperties(ThangTypeSchema, 'thang.type');

c.extendPatchableProperties(ThangTypeSchema);

c.extendTranslationCoverageProperties(ThangTypeSchema);

module.exports = ThangTypeSchema;
});

;require.register("schemas/models/trial_request.schema", function(exports, require, module) {
var TrialRequestSchema, c;

c = require('./../schemas');

TrialRequestSchema = c.object({
  title: 'Trial request',
  required: ['type']
});

_.extend(TrialRequestSchema.properties, {
  applicant: c.objectId({
    links: [
      {
        rel: 'extra',
        href: '/db/user/{($)}'
      }
    ]
  }),
  created: c.date(),
  prepaidCode: c.objectId(),
  reviewDate: c.date({
    readOnly: true
  }),
  reviewer: c.objectId({
    links: [
      {
        rel: 'extra',
        href: '/db/user/{($)}'
      }
    ]
  }),
  properties: {
    type: 'object',
    description: 'Data specific to this request.'
  },
  status: {
    type: 'string',
    'enum': ['submitted', 'approved', 'denied']
  },
  type: {
    type: 'string',
    'enum': ['course', 'subscription']
  }
});

c.extendBasicProperties(TrialRequestSchema, 'TrialRequest');

module.exports = TrialRequestSchema;
});

;require.register("schemas/models/user-polls-record.schema", function(exports, require, module) {
var UserPollsRecordSchema, c;

c = require('./../schemas');

UserPollsRecordSchema = c.object({
  title: 'UserPollsRecord'
});

_.extend(UserPollsRecordSchema.properties, {
  user: c.stringID({
    links: [
      {
        rel: 'extra',
        href: '/db/user/{($)}'
      }
    ]
  }),
  polls: {
    type: 'object',
    additionalProperties: c.shortString({
      pattern: '^[a-z0-9-]+$'
    })
  },
  rewards: {
    type: 'object',
    additionalProperties: c.object({}, {
      random: {
        type: 'number',
        minimum: 0,
        maximum: 1
      },
      level: {
        type: 'integer',
        minimum: 1
      }
    })
  },
  level: {
    type: 'integer',
    minimum: 1,
    description: 'The player level when last saved.'
  },
  changed: c.date({
    title: 'Changed',
    readOnly: true
  })
});

c.extendBasicProperties(UserPollsRecordSchema, 'user-polls-record');

module.exports = UserPollsRecordSchema;
});

;require.register("schemas/models/user", function(exports, require, module) {
var UserSchema, c, emailSubscriptions, locationFilter, phoneScreenFilter, roleFilter, schoolFilter, seniorityFilter, visa;

c = require('./../schemas');

emailSubscriptions = ['announcement', 'tester', 'level_creator', 'developer', 'article_editor', 'translator', 'support', 'notification'];

UserSchema = c.object({
  title: 'User',
  "default": {
    visa: 'Authorized to work in the US',
    music: true,
    name: 'Anonymous',
    autocastDelay: 5000,
    emails: {},
    permissions: [],
    anonymous: true,
    points: 0,
    preferredLanguage: 'en-US',
    aceConfig: {},
    simulatedBy: 0,
    simulatedFor: 0,
    jobProfile: {},
    earned: {
      heroes: [],
      items: [],
      levels: [],
      gems: 0
    },
    purchased: {
      heroes: [],
      items: [],
      levels: [],
      gems: 0
    }
  }
});

c.extendNamedProperties(UserSchema);

phoneScreenFilter = {
  title: 'Phone screened',
  type: 'boolean',
  description: 'Whether the candidate has been phone screened.'
};

schoolFilter = {
  title: 'School',
  type: 'string',
  "enum": ['Top School', 'Other']
};

locationFilter = {
  title: 'Location',
  type: 'string',
  "enum": ['Bay Area', 'New York', 'Other US', 'International']
};

roleFilter = {
  title: 'Role',
  type: 'string',
  "enum": ['Web Developer', 'Software Developer', 'Mobile Developer']
};

seniorityFilter = {
  title: 'Seniority',
  type: 'string',
  "enum": ['College Student', 'Recent Grad', 'Junior', 'Senior']
};

visa = c.shortString({
  title: 'US Work Status',
  description: 'Are you authorized to work in the US, or do you need visa sponsorship? (If you live in Canada or Australia, mark authorized.)',
  "enum": ['Authorized to work in the US', 'Need visa sponsorship']
});

_.extend(UserSchema.properties, {
  email: c.shortString({
    title: 'Email',
    format: 'email'
  }),
  emailVerified: {
    type: 'boolean'
  },
  iosIdentifierForVendor: c.shortString({
    format: 'hidden'
  }),
  firstName: c.shortString({
    title: 'First Name'
  }),
  lastName: c.shortString({
    title: 'Last Name'
  }),
  gender: {
    type: 'string'
  },
  ageRange: {
    type: 'string'
  },
  password: c.passwordString,
  passwordReset: {
    type: 'string'
  },
  photoURL: {
    type: 'string',
    format: 'image-file',
    title: 'Profile Picture',
    description: 'Upload a 256x256px or larger image to serve as your profile picture.'
  },
  facebookID: c.shortString({
    title: 'Facebook ID'
  }),
  githubID: {
    type: 'integer',
    title: 'GitHub ID'
  },
  gplusID: c.shortString({
    title: 'G+ ID'
  }),
  cleverID: c.shortString({
    title: 'Clever ID'
  }),
  oAuthIdentities: {
    description: 'List of OAuth identities this user has.',
    type: 'array',
    items: {
      description: 'A single OAuth identity',
      type: 'object',
      properties: {
        provider: c.objectId(),
        id: {
          type: 'string',
          description: 'The service provider\'s id for the user'
        }
      }
    }
  },
  clientCreator: c.objectId({
    description: 'Client which created this user'
  }),
  wizardColor1: c.pct({
    title: 'Wizard Clothes Color'
  }),
  volume: c.pct({
    title: 'Volume'
  }),
  music: {
    type: 'boolean'
  },
  autocastDelay: {
    type: 'integer'
  },
  lastLevel: {
    type: 'string'
  },
  heroConfig: c.HeroConfigSchema,
  emailSubscriptions: c.array({
    uniqueItems: true
  }, {
    'enum': emailSubscriptions
  }),
  emails: c.object({
    title: 'Email Settings',
    "default": {
      generalNews: {
        enabled: true
      },
      anyNotes: {
        enabled: true
      },
      recruitNotes: {
        enabled: true
      }
    }
  }, {
    generalNews: {
      $ref: '#/definitions/emailSubscription'
    },
    adventurerNews: {
      $ref: '#/definitions/emailSubscription'
    },
    ambassadorNews: {
      $ref: '#/definitions/emailSubscription'
    },
    archmageNews: {
      $ref: '#/definitions/emailSubscription'
    },
    artisanNews: {
      $ref: '#/definitions/emailSubscription'
    },
    diplomatNews: {
      $ref: '#/definitions/emailSubscription'
    },
    teacherNews: {
      $ref: '#/definitions/emailSubscription'
    },
    scribeNews: {
      $ref: '#/definitions/emailSubscription'
    },
    anyNotes: {
      $ref: '#/definitions/emailSubscription'
    },
    recruitNotes: {
      $ref: '#/definitions/emailSubscription'
    },
    employerNotes: {
      $ref: '#/definitions/emailSubscription'
    },
    oneTimes: c.array({
      title: 'One-time emails'
    }, c.object({
      title: 'One-time email',
      required: ['type', 'email']
    }, {
      type: c.shortString(),
      email: c.shortString(),
      sent: c.date()
    }))
  }),
  permissions: c.array({}, c.shortString()),
  dateCreated: c.date({
    title: 'Date Joined'
  }),
  anonymous: {
    type: 'boolean'
  },
  testGroupNumber: {
    type: 'integer',
    minimum: 0,
    maximum: 256,
    exclusiveMaximum: true
  },
  mailChimp: {
    type: 'object'
  },
  hourOfCode: {
    type: 'boolean'
  },
  hourOfCodeComplete: {
    type: 'boolean'
  },
  lastIP: {
    type: 'string'
  },
  emailLower: c.shortString(),
  nameLower: c.shortString(),
  passwordHash: {
    type: 'string',
    maxLength: 256
  },
  emailHash: {
    type: 'string'
  },
  preferredLanguage: {
    'enum': [null].concat(c.getLanguageCodeArray())
  },
  signedCLA: c.date({
    title: 'Date Signed the CLA'
  }),
  wizard: c.object({}, {
    colorConfig: c.object({
      additionalProperties: c.colorConfig()
    })
  }),
  aceConfig: c.object({
    "default": {
      language: 'python',
      keyBindings: 'default',
      invisibles: false,
      indentGuides: false,
      behaviors: false,
      liveCompletion: true
    }
  }, {
    language: {
      type: 'string',
      'enum': ['python', 'javascript', 'coffeescript', 'clojure', 'lua', 'java', 'io']
    },
    keyBindings: {
      type: 'string',
      'enum': ['default', 'vim', 'emacs']
    },
    invisibles: {
      type: 'boolean'
    },
    indentGuides: {
      type: 'boolean'
    },
    behaviors: {
      type: 'boolean'
    },
    liveCompletion: {
      type: 'boolean'
    }
  }),
  simulatedBy: {
    type: 'integer',
    minimum: 0
  },
  simulatedFor: {
    type: 'integer',
    minimum: 0
  },
  jobProfile: c.object({
    title: 'Job Profile',
    "default": {
      active: false,
      lookingFor: 'Full-time',
      jobTitle: 'Software Developer',
      city: 'Defaultsville, CA',
      country: 'USA',
      skills: ['javascript'],
      shortDescription: 'Programmer seeking to build great software.',
      longDescription: '* I write great code.\n* You need great code?\n* Great!'
    }
  }, {
    lookingFor: {
      title: 'Looking For',
      type: 'string',
      "enum": ['Full-time', 'Part-time', 'Remote', 'Contracting', 'Internship'],
      description: 'What kind of developer position do you want?'
    },
    jobTitle: {
      type: 'string',
      maxLength: 50,
      title: 'Desired Job Title',
      description: 'What role are you looking for? Ex.: "Full Stack Engineer", "Front-End Developer", "iOS Developer"'
    },
    active: {
      title: 'Open to Offers',
      type: 'boolean',
      description: 'Want interview offers right now?'
    },
    updated: c.date({
      title: 'Last Updated',
      description: 'How fresh your profile appears to employers. Profiles go inactive after 4 weeks.'
    }),
    name: c.shortString({
      title: 'Name',
      description: 'Name you want employers to see, like "Nick Winter".'
    }),
    city: c.shortString({
      title: 'City',
      description: 'City you want to work in (or live in now), like "San Francisco" or "Lubbock, TX".',
      format: 'city'
    }),
    country: c.shortString({
      title: 'Country',
      description: 'Country you want to work in (or live in now), like "USA" or "France".',
      format: 'country'
    }),
    skills: c.array({
      title: 'Skills',
      description: 'Tag relevant developer skills in order of proficiency',
      maxItems: 30,
      uniqueItems: true
    }, {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      description: 'Ex.: "objective-c", "mongodb", "rails", "android", "javascript"',
      format: 'skill'
    }),
    experience: {
      type: 'integer',
      title: 'Years of Experience',
      minimum: 0,
      description: 'How many years of professional experience (getting paid) developing software do you have?'
    },
    shortDescription: {
      type: 'string',
      maxLength: 140,
      title: 'Short Description',
      description: 'Who are you, and what are you looking for? 140 characters max.'
    },
    longDescription: {
      type: 'string',
      maxLength: 600,
      title: 'Description',
      description: 'Describe yourself to potential employers. Keep it short and to the point. We recommend outlining the position that would most interest you. Tasteful markdown okay; 600 characters max.',
      format: 'markdown'
    },
    visa: visa,
    work: c.array({
      title: 'Work Experience',
      description: 'List your relevant work experience, most recent first.'
    }, c.object({
      title: 'Job',
      description: 'Some work experience you had.',
      required: ['employer', 'role', 'duration']
    }, {
      employer: c.shortString({
        title: 'Employer',
        description: 'Name of your employer.'
      }),
      role: c.shortString({
        title: 'Job Title',
        description: 'What was your job title or role?'
      }),
      duration: c.shortString({
        title: 'Duration',
        description: 'When did you hold this gig? Ex.: "Feb 2013 - present".'
      }),
      description: {
        type: 'string',
        title: 'Description',
        description: 'What did you do there? (140 chars; optional)',
        maxLength: 140
      }
    })),
    education: c.array({
      title: 'Education',
      description: 'List your academic ordeals.'
    }, c.object({
      title: 'Ordeal',
      description: 'Some education that befell you.',
      required: ['school', 'degree', 'duration']
    }, {
      school: c.shortString({
        title: 'School',
        description: 'Name of your school.'
      }),
      degree: c.shortString({
        title: 'Degree',
        description: 'What was your degree and field of study? Ex. Ph.D. Human-Computer Interaction (incomplete)'
      }),
      duration: c.shortString({
        title: 'Dates',
        description: 'When? Ex.: "Aug 2004 - May 2008".'
      }),
      description: {
        type: 'string',
        title: 'Description',
        description: 'Highlight anything about this educational experience. (140 chars; optional)',
        maxLength: 140
      }
    })),
    projects: c.array({
      title: 'Projects (Top 3)',
      description: 'Highlight your projects to amaze employers.',
      maxItems: 3
    }, c.object({
      title: 'Project',
      description: 'A project you created.',
      required: ['name', 'description', 'picture'],
      "default": {
        name: 'My Project',
        description: 'A project I worked on.',
        link: 'http://example.com',
        picture: ''
      }
    }, {
      name: c.shortString({
        title: 'Project Name',
        description: 'What was the project called?'
      }),
      description: {
        type: 'string',
        title: 'Description',
        description: 'Briefly describe the project.',
        maxLength: 400,
        format: 'markdown'
      },
      picture: {
        type: 'string',
        title: 'Picture',
        format: 'image-file',
        description: 'Upload a 230x115px or larger image showing off the project.'
      },
      link: c.url({
        title: 'Link',
        description: 'Link to the project.'
      })
    })),
    links: c.array({
      title: 'Personal and Social Links',
      description: 'Link any other sites or profiles you want to highlight, like your GitHub, your LinkedIn, or your blog.'
    }, c.object({
      title: 'Link',
      description: 'A link to another site you want to highlight, like your GitHub, your LinkedIn, or your blog.',
      required: ['name', 'link'],
      "default": {
        link: 'http://example.com'
      }
    }, {
      name: {
        type: 'string',
        maxLength: 30,
        title: 'Link Name',
        description: 'What are you linking to? Ex: "Personal Website", "GitHub"',
        format: 'link-name'
      },
      link: c.url({
        title: 'Link',
        description: 'The URL.'
      })
    })),
    photoURL: {
      type: 'string',
      format: 'image-file',
      title: 'Profile Picture',
      description: 'Upload a 256x256px or larger image if you want to show a different profile picture to employers than your normal avatar.'
    },
    curated: c.object({
      title: 'Curated',
      required: ['shortDescription', 'mainTag', 'location', 'education', 'workHistory', 'phoneScreenFilter', 'schoolFilter', 'locationFilter', 'roleFilter', 'seniorityFilter']
    }, {
      shortDescription: {
        title: 'Short description',
        description: 'A sentence or two describing the candidate',
        type: 'string'
      },
      mainTag: {
        title: 'Main tag',
        description: 'A main tag to describe this candidate',
        type: 'string'
      },
      location: {
        title: 'Location',
        description: 'The CURRENT location of the candidate',
        type: 'string'
      },
      education: {
        title: 'Education',
        description: 'The main educational institution of the candidate',
        type: 'string'
      },
      workHistory: c.array({
        title: 'Work history',
        description: 'One or two places the candidate has worked',
        type: 'array'
      }, {
        title: 'Workplace',
        type: 'string'
      }),
      phoneScreenFilter: phoneScreenFilter,
      schoolFilter: schoolFilter,
      locationFilter: locationFilter,
      roleFilter: roleFilter,
      seniorityFilter: seniorityFilter,
      featured: {
        title: 'Featured',
        type: 'boolean',
        description: 'Should this candidate be prominently featured on the site?'
      }
    })
  }),
  jobProfileApproved: {
    title: 'Job Profile Approved',
    type: 'boolean',
    description: 'Whether your profile has been approved by CodeCombat.'
  },
  jobProfileApprovedDate: c.date({
    title: 'Approved date',
    description: 'The date that the candidate was approved'
  }),
  jobProfileNotes: {
    type: 'string',
    maxLength: 1000,
    title: 'Our Notes',
    description: 'CodeCombat\'s notes on the candidate.',
    format: 'markdown'
  },
  employerAt: c.shortString({
    description: 'If given employer permissions to view job candidates, for which employer?'
  }),
  signedEmployerAgreement: c.object({}, {
    linkedinID: c.shortString({
      title: 'LinkedInID',
      description: 'The user\'s LinkedIn ID when they signed the contract.'
    }),
    date: c.date({
      title: 'Date signed employer agreement'
    }),
    data: c.object({
      description: 'Cached LinkedIn data slurped from profile.',
      additionalProperties: true
    })
  }),
  savedEmployerFilterAlerts: c.array({
    title: 'Saved Employer Filter Alerts',
    description: 'Employers can get emailed alerts whenever there are new candidates matching their filters'
  }, c.object({
    title: 'Saved filter set',
    description: 'A saved filter set',
    required: ['phoneScreenFilter', 'schoolFilter', 'locationFilter', 'roleFilter', 'seniorityFilter', 'visa']
  }, {
    phoneScreenFilter: {
      title: 'Phone screen filter values',
      type: 'array',
      items: {
        type: 'boolean'
      }
    },
    schoolFilter: {
      title: 'School filter values',
      type: 'array',
      items: {
        type: schoolFilter.type,
        "enum": schoolFilter["enum"]
      }
    },
    locationFilter: {
      title: 'Location filter values',
      type: 'array',
      items: {
        type: locationFilter.type,
        "enum": locationFilter["enum"]
      }
    },
    roleFilter: {
      title: 'Role filter values',
      type: 'array',
      items: {
        type: roleFilter.type,
        "enum": roleFilter["enum"]
      }
    },
    seniorityFilter: {
      title: 'Seniority filter values',
      type: 'array',
      items: {
        type: roleFilter.type,
        "enum": seniorityFilter["enum"]
      }
    },
    visa: {
      title: 'Visa filter values',
      type: 'array',
      items: {
        type: visa.type,
        "enum": visa["enum"]
      }
    }
  })),
  points: {
    type: 'number'
  },
  activity: {
    type: 'object',
    description: 'Summary statistics about user activity',
    additionalProperties: c.activity
  },
  stats: c.object({
    additionalProperties: false
  }, {
    gamesCompleted: c.int(),
    articleEdits: c.int(),
    levelEdits: c.int(),
    levelSystemEdits: c.int(),
    levelComponentEdits: c.int(),
    thangTypeEdits: c.int(),
    patchesSubmitted: c.int({
      description: 'Amount of patches submitted, not necessarily accepted'
    }),
    patchesContributed: c.int({
      description: 'Amount of patches submitted and accepted'
    }),
    patchesAccepted: c.int({
      description: 'Amount of patches accepted by the user as owner'
    }),
    totalTranslationPatches: c.int(),
    totalMiscPatches: c.int(),
    articleTranslationPatches: c.int(),
    articleMiscPatches: c.int(),
    levelTranslationPatches: c.int(),
    levelMiscPatches: c.int(),
    levelComponentTranslationPatches: c.int(),
    levelComponentMiscPatches: c.int(),
    levelSystemTranslationPatches: c.int(),
    levelSystemMiscPatches: c.int(),
    thangTypeTranslationPatches: c.int(),
    thangTypeMiscPatches: c.int(),
    achievementTranslationPatches: c.int(),
    achievementMiscPatches: c.int(),
    pollTranslationPatches: c.int(),
    pollMiscPatches: c.int(),
    campaignTranslationPatches: c.int(),
    campaignMiscPatches: c.int(),
    courseTranslationPatches: c.int(),
    courseMiscPatches: c.int(),
    courseEdits: c.int(),
    concepts: {
      type: 'object',
      additionalProperties: c.int(),
      description: 'Number of levels completed using each programming concept.'
    }
  }),
  earned: c.RewardSchema('earned by achievements'),
  purchased: c.RewardSchema('purchased with gems or money'),
  deleted: {
    type: 'boolean'
  },
  dateDeleted: c.date(),
  spent: {
    type: 'number'
  },
  stripeCustomerID: {
    type: 'string'
  },
  stripe: c.object({}, {
    customerID: {
      type: 'string'
    },
    planID: {
      "enum": ['basic'],
      description: 'Determines if a user has or wants to subscribe'
    },
    subscriptionID: {
      type: 'string',
      description: 'Determines if a user is subscribed'
    },
    token: {
      type: 'string'
    },
    couponID: {
      type: 'string'
    },
    free: {
      type: ['boolean', 'string'],
      format: 'date-time',
      description: 'Type string is subscription end date'
    },
    prepaidCode: c.shortString({
      description: 'Prepaid code to apply to sub purchase'
    }),
    subscribeEmails: c.array({
      description: 'Input for subscribing other users'
    }, c.shortString()),
    unsubscribeEmail: {
      type: 'string',
      description: 'Input for unsubscribing a sponsored user'
    },
    recipients: c.array({
      title: 'Recipient subscriptions owned by this user'
    }, c.object({
      required: ['userID', 'subscriptionID']
    }, {
      userID: c.objectId({
        description: 'User ID of recipient'
      }),
      subscriptionID: {
        type: 'string'
      },
      couponID: {
        type: 'string'
      }
    })),
    sponsorID: c.objectId({
      description: "User ID that owns this user's subscription"
    }),
    sponsorSubscriptionID: {
      type: 'string',
      description: 'Sponsor aggregate subscription used to pay for all recipient subs'
    }
  }),
  siteref: {
    type: 'string'
  },
  referrer: {
    type: 'string'
  },
  chinaVersion: {
    type: 'boolean'
  },
  country: {
    type: 'string',
    "enum": ['brazil', 'china']
  },
  clans: c.array({}, c.objectId()),
  courseInstances: c.array({}, c.objectId()),
  currentCourse: c.object({}, {
    courseID: c.objectId({}),
    courseInstanceID: c.objectId({})
  }),
  coursePrepaidID: c.objectId({
    description: 'Prepaid which has paid for this user\'s course access'
  }),
  coursePrepaid: {
    type: 'object',
    properties: {
      _id: c.objectId(),
      startDate: c.stringDate(),
      endDate: c.stringDate()
    }
  },
  enrollmentRequestSent: {
    type: 'boolean'
  },
  schoolName: {
    type: 'string',
    description: 'Deprecated string. Use "school" object instead.'
  },
  role: {
    type: 'string',
    "enum": ["God", "advisor", "parent", "principal", "student", "superintendent", "teacher", "technology coordinator"]
  },
  birthday: c.stringDate({
    title: "Birthday"
  }),
  lastAchievementChecked: c.stringDate({
    name: 'Last Achievement Checked'
  }),
  israelId: {
    type: 'string',
    description: 'ID string used just for il.codecombat.com'
  },
  school: {
    type: 'object',
    description: 'Generic property for storing school information. Currently only used by Israel; if/when we use it for other purposes, think about how to keep the data consistent.',
    properties: {
      name: {
        type: 'string'
      },
      city: {
        type: 'string'
      },
      district: {
        type: 'string'
      },
      state: {
        type: 'string'
      },
      country: {
        type: 'string'
      }
    }
  }
});

c.extendBasicProperties(UserSchema, 'user');

UserSchema.definitions = {
  emailSubscription: c.object({
    "default": {
      enabled: true,
      count: 0
    }
  }, {
    enabled: {
      type: 'boolean'
    },
    lastSent: c.date(),
    count: {
      type: 'integer'
    }
  })
};

module.exports = UserSchema;
});

;require.register("schemas/models/user_code_problem", function(exports, require, module) {
var UserCodeProblemSchema, c;

c = require('./../schemas');

UserCodeProblemSchema = c.object({
  title: 'User Code Problem',
  description: 'Data for a problem in user code.'
});

_.extend(UserCodeProblemSchema.properties, {
  creator: c.objectId({
    links: [
      {
        rel: 'extra',
        href: '/db/user/{($)}'
      }
    ]
  }),
  created: c.date({
    title: 'Created',
    readOnly: true
  }),
  code: {
    type: 'string'
  },
  codeSnippet: {
    type: 'string'
  },
  errHint: {
    type: 'string'
  },
  errId: {
    type: 'string'
  },
  errLevel: {
    type: 'string'
  },
  errMessage: {
    type: 'string'
  },
  errMessageNoLineInfo: {
    type: 'string'
  },
  errRange: {
    type: 'array'
  },
  errType: {
    type: 'string'
  },
  language: {
    type: 'string'
  },
  levelID: {
    type: 'string'
  }
});

c.extendBasicProperties(UserCodeProblemSchema, 'user.code.problem');

module.exports = UserCodeProblemSchema;
});

;require.register("schemas/models/user_remark", function(exports, require, module) {
var UserRemarkSchema, c;

c = require('./../schemas');

UserRemarkSchema = c.object({
  title: 'Remark',
  description: 'Remarks on a user, point of contact, tasks.'
});

_.extend(UserRemarkSchema.properties, {
  user: c.objectId({
    links: [
      {
        rel: 'extra',
        href: '/db/user/{($)}'
      }
    ]
  }),
  contact: c.objectId({
    links: [
      {
        rel: 'extra',
        href: '/db/user/{($)}'
      }
    ]
  }),
  created: c.date({
    title: 'Created',
    readOnly: true
  }),
  history: c.array({
    title: 'History',
    description: 'Records of our interactions with the user.'
  }, c.object({
    title: 'Record'
  }, {
    date: c.date({
      title: 'Date'
    }),
    content: {
      title: 'Content',
      type: 'string',
      format: 'markdown'
    }
  })),
  tasks: c.array({
    title: 'Tasks',
    description: 'Task entries: when to email the contact about something.'
  }, c.object({
    title: 'Task'
  }, {
    date: c.date({
      title: 'Date'
    }),
    action: {
      title: 'Action',
      type: 'string'
    },
    status: {
      title: 'Status',
      description: 'The current status of the task',
      type: 'string',
      "enum": ['Not started', 'In progress', 'Completed']
    },
    notes: {
      title: 'Notes',
      description: 'Notes about the task in progress',
      type: 'string',
      format: 'markdown'
    }
  })),
  userName: {
    title: 'Player Name',
    type: 'string'
  },
  contactName: {
    title: 'Contact Name',
    type: 'string'
  }
});

c.extendBasicProperties(UserRemarkSchema, 'user.remark');

module.exports = UserRemarkSchema;
});

;require.register("schemas/schemas", function(exports, require, module) {
var ColorConfigSchema, Language, PointSchema, SoundSchema, basicProps, combine, me, namedProps, patchableProps, pathPattern, permissionsProps, searchableProps, urlPattern, versionedProps;

Language = require('./languages');

me = module.exports;

combine = function(base, ext) {
  if (ext == null) {
    return base;
  }
  return _.extend(base, ext);
};

urlPattern = '^(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&%\$#_=]*)?$';

pathPattern = '^\/([a-zA-Z0-9\-\.\?\,\'\/\\\+&%\$#_=]*)?$';

me.object = function(ext, props) {
  return combine({
    type: 'object',
    additionalProperties: false,
    properties: props || {}
  }, ext);
};

me.array = function(ext, items) {
  return combine({
    type: 'array',
    items: items || {}
  }, ext);
};

me.shortString = function(ext) {
  return combine({
    type: 'string',
    maxLength: 100
  }, ext);
};

me.pct = function(ext) {
  return combine({
    type: 'number',
    maximum: 1.0,
    minimum: 0.0
  }, ext);
};

me.passwordString = {
  type: 'string',
  maxLength: 256,
  minLength: 2,
  title: 'Password'
};

me.date = function(ext) {
  return combine({
    type: ['object', 'string'],
    format: 'date-time'
  }, ext);
};

me.stringDate = function(ext) {
  return combine({
    type: ['string'],
    format: 'date-time'
  }, ext);
};

me.objectId = function(ext) {
  return combine({
    type: ['object', 'string']
  }, ext);
};

me.stringID = function(ext) {
  return combine({
    type: 'string',
    minLength: 24,
    maxLength: 24
  }, ext);
};

me.url = function(ext) {
  return combine({
    type: 'string',
    format: 'url',
    pattern: urlPattern
  }, ext);
};

me.path = function(ext) {
  return combine({
    type: 'string',
    pattern: pathPattern
  }, ext);
};

me.int = function(ext) {
  return combine({
    type: 'integer'
  }, ext);
};

me.float = function(ext) {
  return combine({
    type: 'number'
  }, ext);
};

PointSchema = me.object({
  title: 'Point',
  description: 'An {x, y} coordinate point.',
  format: 'point2d',
  required: ['x', 'y']
}, {
  x: {
    title: 'x',
    description: 'The x coordinate.',
    type: 'number',
    'default': 15
  },
  y: {
    title: 'y',
    description: 'The y coordinate.',
    type: 'number',
    'default': 20
  }
});

me.point2d = function(ext) {
  return combine(_.cloneDeep(PointSchema), ext);
};

SoundSchema = me.object({
  format: 'sound'
}, {
  mp3: {
    type: 'string',
    format: 'sound-file'
  },
  ogg: {
    type: 'string',
    format: 'sound-file'
  }
});

me.sound = function(props) {
  var obj, prop;
  obj = _.cloneDeep(SoundSchema);
  for (prop in props) {
    obj.properties[prop] = props[prop];
  }
  return obj;
};

ColorConfigSchema = me.object({
  format: 'color-sound'
}, {
  hue: {
    format: 'range',
    type: 'number',
    minimum: 0,
    maximum: 1
  },
  saturation: {
    format: 'range',
    type: 'number',
    minimum: 0,
    maximum: 1
  },
  lightness: {
    format: 'range',
    type: 'number',
    minimum: 0,
    maximum: 1
  }
});

me.colorConfig = function(props) {
  var obj, prop;
  obj = _.cloneDeep(ColorConfigSchema);
  for (prop in props) {
    obj.properties[prop] = props[prop];
  }
  return obj;
};

basicProps = function(linkFragment) {
  return {
    _id: me.objectId({
      links: [
        {
          rel: 'self',
          href: "/db/" + linkFragment + "/{($)}"
        }
      ],
      format: 'hidden'
    }),
    __v: {
      title: 'Mongoose Version',
      format: 'hidden'
    }
  };
};

me.extendBasicProperties = function(schema, linkFragment) {
  if (schema.properties == null) {
    schema.properties = {};
  }
  return _.extend(schema.properties, basicProps(linkFragment));
};

patchableProps = function() {
  return {
    patches: me.array({
      title: 'Patches'
    }, {
      _id: me.objectId({
        links: [
          {
            rel: 'db',
            href: '/db/patch/{($)}'
          }
        ],
        title: 'Patch ID',
        description: 'A reference to the patch.'
      }),
      status: {
        "enum": ['pending', 'accepted', 'rejected', 'cancelled']
      }
    }),
    allowPatches: {
      type: 'boolean'
    },
    watchers: me.array({
      title: 'Watchers'
    }, me.objectId({
      links: [
        {
          rel: 'extra',
          href: '/db/user/{($)}'
        }
      ]
    }))
  };
};

me.extendPatchableProperties = function(schema) {
  if (schema.properties == null) {
    schema.properties = {};
  }
  return _.extend(schema.properties, patchableProps());
};

namedProps = function() {
  return {
    name: me.shortString({
      title: 'Name'
    }),
    slug: me.shortString({
      title: 'Slug',
      format: 'hidden'
    })
  };
};

me.extendNamedProperties = function(schema) {
  if (schema.properties == null) {
    schema.properties = {};
  }
  return _.extend(schema.properties, namedProps());
};

versionedProps = function(linkFragment) {
  return {
    version: {
      'default': {
        minor: 0,
        major: 0,
        isLatestMajor: true,
        isLatestMinor: true
      },
      format: 'version',
      title: 'Version',
      type: 'object',
      readOnly: true,
      additionalProperties: false,
      properties: {
        major: {
          type: 'number',
          minimum: 0
        },
        minor: {
          type: 'number',
          minimum: 0
        },
        isLatestMajor: {
          type: 'boolean'
        },
        isLatestMinor: {
          type: 'boolean'
        }
      }
    },
    original: me.objectId({
      links: [
        {
          rel: 'extra',
          href: "/db/" + linkFragment + "/{($)}"
        }
      ],
      format: 'hidden'
    }),
    parent: me.objectId({
      links: [
        {
          rel: 'extra',
          href: "/db/" + linkFragment + "/{($)}"
        }
      ],
      format: 'hidden'
    }),
    creator: me.objectId({
      links: [
        {
          rel: 'extra',
          href: '/db/user/{($)}'
        }
      ],
      format: 'hidden'
    }),
    created: me.date({
      title: 'Created',
      readOnly: true
    }),
    commitMessage: {
      type: 'string',
      maxLength: 500,
      title: 'Commit Message',
      readOnly: true
    }
  };
};

me.extendVersionedProperties = function(schema, linkFragment) {
  if (schema.properties == null) {
    schema.properties = {};
  }
  return _.extend(schema.properties, versionedProps(linkFragment));
};

searchableProps = function() {
  return {
    index: {
      format: 'hidden'
    }
  };
};

me.extendSearchableProperties = function(schema) {
  if (schema.properties == null) {
    schema.properties = {};
  }
  return _.extend(schema.properties, searchableProps());
};

permissionsProps = function() {
  return {
    permissions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          target: {},
          access: {
            type: 'string',
            'enum': ['read', 'write', 'owner']
          }
        }
      },
      format: 'hidden'
    }
  };
};

me.extendPermissionsProperties = function(schema) {
  if (schema.properties == null) {
    schema.properties = {};
  }
  return _.extend(schema.properties, permissionsProps());
};

me.generateLanguageCodeArrayRegex = function() {
  return '^(' + Language.languageCodes.join('|') + ')$';
};

me.getLanguageCodeArray = function() {
  return Language.languageCodes;
};

me.getLanguagesObject = function() {
  return Language;
};

me.extendTranslationCoverageProperties = function(schema) {
  if (schema.properties == null) {
    schema.properties = {};
  }
  return schema.properties.i18nCoverage = {
    title: 'i18n Coverage',
    type: 'array',
    items: {
      type: 'string'
    }
  };
};

me.classNamePattern = '^[A-Z][A-Za-z0-9]*$';

me.identifierPattern = '^[a-z][A-Za-z0-9]*$';

me.constantPattern = '^[A-Z0-9_]+$';

me.identifierOrConstantPattern = '^([a-z][A-Za-z0-9]*|[A-Z0-9_]+)$';

me.FunctionArgumentSchema = me.object({
  title: 'Function Argument',
  description: 'Documentation entry for a function argument.',
  'default': {
    name: 'target',
    type: 'object',
    optional: false,
    example: 'this.getNearestEnemy()',
    description: 'The target of this function.'
  },
  required: ['name', 'type', 'example', 'description']
}, {
  name: {
    type: 'string',
    pattern: me.identifierPattern,
    title: 'Name',
    description: 'Name of the function argument.'
  },
  i18n: {
    type: 'object',
    format: 'i18n',
    props: ['description'],
    description: 'Help translate this argument'
  },
  type: me.shortString({
    title: 'Type',
    description: 'Intended type of the argument.'
  }),
  optional: {
    title: 'Optional',
    description: 'Whether an argument may be omitted when calling the function',
    type: 'boolean'
  },
  example: {
    oneOf: [
      {
        type: 'object',
        title: 'Language Examples',
        description: 'Examples by code language.',
        additionalProperties: me.shortString({
          description: 'Example value for the argument.'
        }),
        format: 'code-languages-object',
        "default": {
          javascript: '',
          python: ''
        }
      }, me.shortString({
        title: 'Example',
        description: 'Example value for the argument.'
      })
    ]
  },
  description: {
    oneOf: [
      {
        type: 'object',
        title: 'Language Descriptions',
        description: 'Example argument descriptions by code language.',
        additionalProperties: {
          type: 'string',
          description: 'Description of the argument.',
          maxLength: 1000
        },
        format: 'code-languages-object',
        "default": {
          javascript: '',
          python: ''
        }
      }, {
        title: 'Description',
        type: 'string',
        description: 'Description of the argument.',
        maxLength: 1000
      }
    ]
  },
  'default': {
    title: 'Default',
    description: 'Default value of the argument. (Your code should set this.)',
    'default': null
  }
});

me.codeSnippet = me.object({
  description: 'A language-specific code snippet'
}, {
  code: {
    type: 'string',
    format: 'code',
    title: 'Snippet',
    "default": '',
    description: 'Code snippet. Use ${1:defaultValue} syntax to add flexible arguments'
  },
  tab: {
    type: 'string',
    title: 'Tab Trigger',
    description: 'Tab completion text. Will be expanded to the snippet if typed and hit tab.'
  }
});

me.activity = me.object({
  description: 'Stats on an activity'
}, {
  first: me.date(),
  last: me.date(),
  count: {
    type: 'integer',
    minimum: 0
  }
});

me.terrainString = me.shortString({
  "enum": ['Grass', 'Dungeon', 'Indoor', 'Desert', 'Mountain', 'Glacier', 'Volcano'],
  title: 'Terrain',
  description: 'Which terrain type this is.'
});

me.HeroConfigSchema = me.object({
  description: 'Which hero the player is using, equipped with what inventory.'
}, {
  inventory: {
    type: 'object',
    description: 'The inventory of the hero: slots to item ThangTypes.',
    additionalProperties: me.objectId({
      description: 'An item ThangType.'
    })
  },
  thangType: me.objectId({
    links: [
      {
        rel: 'db',
        href: '/db/thang.type/{($)}/version'
      }
    ],
    title: 'Thang Type',
    description: 'The ThangType of the hero.',
    format: 'thang-type'
  })
});

me.RewardSchema = function(descriptionFragment) {
  if (descriptionFragment == null) {
    descriptionFragment = 'earned by achievements';
  }
  return {
    type: 'object',
    additionalProperties: false,
    description: "Rewards " + descriptionFragment + ".",
    properties: {
      heroes: me.array({
        uniqueItems: true,
        description: "Heroes " + descriptionFragment + "."
      }, me.stringID({
        links: [
          {
            rel: 'db',
            href: '/db/thang.type/{($)}/version'
          }
        ],
        title: 'Hero ThangType',
        description: 'A reference to the earned hero ThangType.',
        format: 'thang-type'
      })),
      items: me.array({
        uniqueItems: true,
        description: "Items " + descriptionFragment + "."
      }, me.stringID({
        links: [
          {
            rel: 'db',
            href: '/db/thang.type/{($)}/version'
          }
        ],
        title: 'Item ThangType',
        description: 'A reference to the earned item ThangType.',
        format: 'thang-type'
      })),
      levels: me.array({
        uniqueItems: true,
        description: "Levels " + descriptionFragment + "."
      }, me.stringID({
        links: [
          {
            rel: 'db',
            href: '/db/level/{($)}/version'
          }
        ],
        title: 'Level',
        description: 'A reference to the earned Level.',
        format: 'latest-version-original-reference'
      })),
      gems: me.float({
        description: "Gems " + descriptionFragment + "."
      })
    }
  };
};

me.task = me.object({
  title: 'Task',
  description: 'A task to be completed',
  format: 'task',
  "default": {
    name: 'TODO',
    complete: false
  }
}, {
  name: {
    title: 'Name',
    description: 'What must be done?',
    type: 'string'
  },
  complete: {
    title: 'Complete',
    description: 'Whether this task is done.',
    type: 'boolean',
    format: 'checkbox'
  }
});

me.concept = me.shortString({
  "enum": ['advanced_strings', 'algorithms', 'arguments', 'arithmetic', 'arrays', 'basic_syntax', 'boolean_logic', 'break_statements', 'classes', 'continue_statements', 'for_loops', 'functions', 'graphics', 'if_statements', 'input_handling', 'math_operations', 'object_literals', 'parameters', 'strings', 'variables', 'vectors', 'while_loops', 'recursion', 'basic_html', 'basic_css', 'basic_web_scripting', 'intermediate_html', 'intermediate_css', 'intermediate_web_scripting', 'advanced_html', 'advanced_css', 'advanced_web_scripting', 'jquery', 'bootstrap']
});
});

;require.register("schemas/subscriptions/auth", function(exports, require, module) {
var c;

c = require('schemas/schemas');

module.exports = {
  'auth:me-synced': c.object({
    required: ['me']
  }, {
    me: {
      type: 'object'
    }
  }),
  'auth:signed-up': c.object({}),
  'auth:logging-out': c.object({}),
  'auth:linkedin-api-loaded': c.object({}),
  'auth:log-in-with-github': c.object({})
};
});

;require.register("schemas/subscriptions/bus", function(exports, require, module) {
var c;

c = require('schemas/schemas');

module.exports = {
  'bus:connecting': c.object({
    title: 'Bus Connecting',
    description: 'Published when a Bus starts connecting'
  }, {
    bus: {
      $ref: 'bus'
    }
  }),
  'bus:connected': c.object({
    title: 'Bus Connected',
    description: 'Published when a Bus has connected'
  }, {
    bus: {
      $ref: 'bus'
    }
  }),
  'bus:disconnected': c.object({
    title: 'Bus Disconnected',
    description: 'Published when a Bus has disconnected'
  }, {
    bus: {
      $ref: 'bus'
    }
  }),
  'bus:new-message': c.object({
    title: 'Message sent',
    description: 'A new message was sent'
  }, {
    message: {
      type: 'object'
    },
    bus: {
      $ref: 'bus'
    }
  }),
  'bus:player-joined': c.object({
    title: 'Player joined',
    description: 'A new player has joined'
  }, {
    player: {
      type: 'object'
    },
    bus: {
      $ref: 'bus'
    }
  }),
  'bus:player-left': c.object({
    title: 'Player left',
    description: 'A player has left'
  }, {
    player: {
      type: 'object'
    },
    bus: {
      $ref: 'bus'
    }
  }),
  'bus:player-states-changed': c.object({
    title: 'Player state changes',
    description: 'State of the players has changed'
  }, {
    states: {
      type: 'object',
      additionalProperties: {
        type: 'object'
      }
    },
    bus: {
      $ref: 'bus'
    }
  })
};
});

;require.register("schemas/subscriptions/editor", function(exports, require, module) {
var c;

c = require('schemas/schemas');

module.exports = {
  'editor:campaign-analytics-modal-closed': c.object({
    title: 'Campaign editor analytics modal closed'
  }, {
    targetLevelSlug: {
      type: 'string'
    }
  }),
  'editor:view-switched': c.object({
    title: 'Level View Switched',
    description: 'Published whenever the view switches'
  }, {
    targetURL: {
      type: 'string'
    }
  }),
  'editor:level-component-editing-ended': c.object({
    required: ['component']
  }, {
    component: {
      type: 'object'
    }
  }),
  'editor:edit-level-system': c.object({
    required: ['original', 'majorVersion']
  }, {
    original: {
      type: 'string'
    },
    majorVersion: {
      type: 'integer',
      minimum: 0
    }
  }),
  'editor:level-system-added': c.object({
    required: ['system']
  }, {
    system: {
      type: 'object'
    }
  }),
  'editor:level-system-editing-ended': c.object({
    required: ['system']
  }, {
    system: {
      type: 'object'
    }
  }),
  'editor:edit-level-thang': c.object({
    required: ['thangID']
  }, {
    thangID: {
      type: 'string'
    }
  }),
  'editor:level-thang-edited': c.object({
    required: ['thangData', 'oldPath']
  }, {
    thangData: {
      type: 'object'
    },
    oldPath: {
      type: 'string'
    }
  }),
  'editor:level-thang-done-editing': c.object({
    required: ['thangData', 'oldPath']
  }, {
    thangData: {
      type: 'object'
    },
    oldPath: {
      type: 'string'
    }
  }),
  'editor:thangs-edited': c.object({
    required: ['thangs']
  }, {
    thangs: c.array({}, {
      type: 'object'
    })
  }),
  'editor:level-loaded': c.object({
    required: ['level']
  }, {
    level: {
      type: 'object'
    }
  }),
  'level:reload-from-data': c.object({
    required: ['level', 'supermodel']
  }, {
    level: {
      type: 'object'
    },
    supermodel: {
      type: 'object'
    }
  }),
  'level:reload-thang-type': c.object({
    required: ['thangType']
  }, {
    thangType: {
      type: 'object'
    }
  }),
  'editor:random-terrain-generated': c.object({
    required: ['thangs', 'terrain']
  }, {
    thangs: c.array({}, {
      type: 'object'
    }),
    terrain: c.terrainString
  }),
  'editor:terrain-changed': c.object({
    required: ['terrain']
  }, {
    terrain: {
      oneOf: [
        c.terrainString, {
          type: ['null', 'undefined']
        }
      ]
    }
  }),
  'editor:thang-type-kind-changed': c.object({
    required: ['kind']
  }, {
    kind: {
      type: 'string'
    }
  }),
  'editor:thang-type-color-groups-changed': c.object({
    required: ['colorGroups']
  }, {
    colorGroups: {
      type: 'object'
    }
  })
};
});

;require.register("schemas/subscriptions/errors", function(exports, require, module) {
var c;

c = require('schemas/schemas');

module.exports = {
  'errors:server-error': c.object({
    required: ['response']
  }, {
    response: {
      type: 'object'
    }
  })
};
});

;require.register("schemas/subscriptions/god", function(exports, require, module) {
var c, goalStatesSchema, worldUpdatedEventSchema;

c = require('schemas/schemas');

goalStatesSchema = {
  type: 'object',
  additionalProperties: {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        oneOf: [
          {
            type: 'null'
          }, {
            type: 'string',
            "enum": ['success', 'failure', 'incomplete']
          }
        ]
      },
      keyFrame: {
        oneOf: [
          {
            type: 'integer',
            minimum: 0
          }, {
            type: 'string',
            "enum": ['end']
          }
        ]
      },
      team: {
        type: ['null', 'string', 'undefined']
      }
    }
  }
};

worldUpdatedEventSchema = c.object({
  required: ['world', 'firstWorld', 'goalStates', 'team', 'firstChangedFrame']
}, {
  world: {
    type: 'object'
  },
  firstWorld: {
    type: 'boolean'
  },
  goalStates: goalStatesSchema,
  team: {
    type: 'string'
  },
  firstChangedFrame: {
    type: 'integer',
    minimum: 0
  },
  finished: {
    type: 'boolean'
  },
  god: {
    type: 'object'
  }
});

module.exports = {
  'god:user-code-problem': c.object({
    required: ['problem', 'god']
  }, {
    god: {
      type: 'object'
    },
    problem: {
      type: 'object'
    }
  }),
  'god:non-user-code-problem': c.object({
    required: ['problem', 'god']
  }, {
    god: {
      type: 'object'
    },
    problem: {
      type: 'object'
    }
  }),
  'god:infinite-loop': c.object({
    required: ['firstWorld', 'god']
  }, {
    god: {
      type: 'object'
    },
    firstWorld: {
      type: 'boolean'
    },
    nonUserCodeProblem: {
      type: 'boolean'
    }
  }),
  'god:new-world-created': worldUpdatedEventSchema,
  'god:streaming-world-updated': worldUpdatedEventSchema,
  'god:new-html-goal-states': c.object({
    required: ['goalStates', 'overallStatus']
  }, {
    goalStates: goalStatesSchema,
    overallStatus: {
      type: ['string', 'null'],
      "enum": ['success', 'failure', 'incomplete', null]
    }
  }),
  'god:goals-calculated': c.object({
    required: ['goalStates', 'god']
  }, {
    god: {
      type: 'object'
    },
    goalStates: goalStatesSchema,
    preload: {
      type: 'boolean'
    },
    overallStatus: {
      type: ['string', 'null'],
      "enum": ['success', 'failure', 'incomplete', null]
    },
    totalFrames: {
      type: ['integer', 'undefined']
    },
    lastFrameHash: {
      type: ['number', 'undefined']
    },
    simulationFrameRate: {
      type: ['number', 'undefined']
    }
  }),
  'god:world-load-progress-changed': c.object({
    required: ['progress', 'god']
  }, {
    god: {
      type: 'object'
    },
    progress: {
      type: 'number',
      minimum: 0,
      maximum: 1
    }
  }),
  'god:debug-world-load-progress-changed': c.object({
    required: ['progress', 'god']
  }, {
    god: {
      type: 'object'
    },
    progress: {
      type: 'number',
      minimum: 0,
      maximum: 1
    }
  }),
  'god:debug-value-return': c.object({
    required: ['key', 'god']
  }, {
    god: {
      type: 'object'
    },
    key: {
      type: 'string'
    },
    value: {}
  })
};
});

;require.register("schemas/subscriptions/ipad", function(exports, require, module) {
var c;

c = require('schemas/schemas');

module.exports = {
  'ipad:products': c.object({
    required: ['products']
  }, {
    products: c.array({}, c.object({}, {
      price: {
        type: 'string'
      },
      id: {
        type: 'string'
      }
    }))
  }),
  'ipad:language-chosen': c.object({}, {
    language: {
      type: 'string'
    }
  }),
  'ipad:iap-complete': c.object({}, {
    productID: {
      type: 'string'
    }
  }),
  'ipad:memory-warning': c.object({})
};
});

;require.register("schemas/subscriptions/misc", function(exports, require, module) {
var c;

c = require('schemas/schemas');

module.exports = {
  'application:idle-changed': c.object({}, {
    idle: {
      type: 'boolean'
    }
  }),
  'application:error': c.object({}, {
    message: {
      type: 'string'
    },
    stack: {
      type: 'string'
    }
  }),
  'audio-player:loaded': c.object({
    required: ['sender']
  }, {
    sender: {
      type: 'object'
    }
  }),
  'audio-player:play-sound': c.object({
    required: ['trigger']
  }, {
    trigger: {
      type: 'string'
    },
    volume: {
      type: 'number',
      minimum: 0,
      maximum: 1
    }
  }),
  'music-player:play-music': c.object({
    required: ['play']
  }, {
    play: {
      type: 'boolean'
    },
    file: {
      type: 'string'
    },
    delay: {
      type: 'integer',
      minimum: 0,
      format: 'milliseconds'
    }
  }),
  'music-player:enter-menu': c.object({
    required: []
  }, {
    terrain: {
      type: 'string'
    }
  }),
  'music-player:exit-menu': c.object({}),
  'modal:opened': c.object({}),
  'modal:closed': c.object({}),
  'modal:open-modal-view': c.object({
    required: ['modalPath']
  }, {
    modalPath: {
      type: 'string'
    }
  }),
  'router:navigate': c.object({
    required: ['route']
  }, {
    route: {
      type: 'string'
    },
    view: {
      type: 'object'
    },
    viewClass: {
      type: ['function', 'string']
    },
    viewArgs: {
      type: 'array'
    }
  }),
  'router:navigated': c.object({
    required: ['route']
  }, {
    route: {
      type: 'string'
    }
  }),
  'achievements:new': c.object({
    required: ['earnedAchievements']
  }, {
    earnedAchievements: {
      type: 'object'
    }
  }),
  'ladder:game-submitted': c.object({
    required: ['session', 'level']
  }, {
    session: {
      type: 'object'
    },
    level: {
      type: 'object'
    }
  }),
  'buy-gems-modal:update-products': {},
  'buy-gems-modal:purchase-initiated': c.object({
    required: ['productID']
  }, {
    productID: {
      type: 'string'
    }
  }),
  'subscribe-modal:subscribed': c.object({}),
  'stripe:received-token': c.object({
    required: ['token']
  }, {
    token: {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        }
      }
    }
  }),
  'store:item-purchased': c.object({
    required: ['item', 'itemSlug']
  }, {
    item: {
      type: 'object'
    },
    itemSlug: {
      type: 'string'
    }
  }),
  'store:hero-purchased': c.object({
    required: ['hero', 'heroSlug']
  }, {
    hero: {
      type: 'object'
    },
    heroSlug: {
      type: 'string'
    }
  }),
  'application:service-loaded': c.object({
    required: ['service']
  }, {
    service: {
      type: 'string'
    }
  }),
  'test:update': c.object({}, {
    state: {
      type: 'string'
    }
  })
};
});

;require.register("schemas/subscriptions/play", function(exports, require, module) {
var c;

c = require('schemas/schemas');

module.exports = {
  'level:session-will-save': c.object({
    required: ['session']
  }, {
    session: {
      type: 'object'
    }
  }),
  'level:shift-space-pressed': c.object({}),
  'level:escape-pressed': c.object({}),
  'level:enable-controls': c.object({}, {
    controls: c.array({}, c.shortString())
  }),
  'level:disable-controls': c.object({}, {
    controls: c.array({}, c.shortString())
  }),
  'level:set-letterbox': c.object({}, {
    on: {
      type: 'boolean'
    }
  }),
  'level:started': c.object({}),
  'level:set-debug': c.object({
    required: ['debug']
  }, {
    debug: {
      type: 'boolean'
    }
  }),
  'level:restart': c.object({}),
  'level:restarted': c.object({}),
  'level:set-volume': c.object({
    required: ['volume']
  }, {
    volume: {
      type: 'number',
      minimum: 0,
      maximum: 1
    }
  }),
  'level:set-time': c.object({}, {
    time: {
      type: 'number',
      minimum: 0
    },
    ratio: {
      type: 'number',
      minimum: 0,
      maximum: 1
    },
    ratioOffset: {
      type: 'number'
    },
    frameOffset: {
      type: 'number'
    },
    scrubDuration: {
      type: 'number',
      minimum: 0
    }
  }),
  'level:select-sprite': c.object({}, {
    thangID: {
      type: ['string', 'null', 'undefined']
    },
    spellName: {
      type: ['string', 'null', 'undefined']
    }
  }),
  'level:set-playing': c.object({
    required: ['playing']
  }, {
    playing: {
      type: 'boolean'
    }
  }),
  'level:team-set': c.object({
    required: ['team']
  }, {
    team: c.shortString()
  }),
  'level:docs-shown': c.object({}),
  'level:docs-hidden': c.object({}),
  'level:flag-color-selected': c.object({}, {
    color: {
      oneOf: [
        {
          type: 'null'
        }, {
          type: 'string',
          "enum": ['green', 'black', 'violet'],
          description: 'The flag color to place next, or omitted/null if deselected.'
        }
      ]
    },
    pos: c.object({
      required: ['x', 'y']
    }, {
      x: {
        type: 'number'
      },
      y: {
        type: 'number'
      }
    })
  }),
  'level:flag-updated': c.object({
    required: ['player', 'color', 'time', 'active']
  }, {
    player: {
      type: 'string'
    },
    team: {
      type: 'string'
    },
    color: {
      type: 'string',
      "enum": ['green', 'black', 'violet']
    },
    time: {
      type: 'number',
      minimum: 0
    },
    active: {
      type: 'boolean'
    },
    pos: c.object({
      required: ['x', 'y']
    }, {
      x: {
        type: 'number'
      },
      y: {
        type: 'number'
      }
    }),
    source: {
      type: 'string',
      "enum": ['click', 'code']
    }
  }),
  'level:next-game-pressed': c.object({}),
  'level:loaded': c.object({
    required: ['level']
  }, {
    level: {
      type: 'object'
    },
    team: {
      type: ['string', 'null', 'undefined']
    }
  }),
  'level:session-loaded': c.object({
    required: ['level', 'session']
  }, {
    level: {
      type: 'object'
    },
    session: {
      type: 'object'
    }
  }),
  'level:loading-view-unveiling': c.object({}),
  'level:loading-view-unveiled': c.object({
    required: ['view']
  }, {
    view: {
      type: 'object'
    }
  }),
  'playback:manually-scrubbed': c.object({
    required: ['ratio']
  }, {
    ratio: {
      type: 'number',
      minimum: 0,
      maximum: 1
    }
  }),
  'playback:stop-real-time-playback': c.object({}),
  'playback:real-time-playback-started': c.object({}),
  'playback:real-time-playback-ended': c.object({}),
  'playback:ended-changed': c.object({
    required: ['ended']
  }, {
    ended: {
      type: 'boolean'
    }
  }),
  'level:toggle-playing': c.object({}),
  'level:toggle-grid': c.object({}),
  'level:toggle-debug': c.object({}),
  'level:toggle-pathfinding': c.object({}),
  'level:scrub-forward': c.object({}),
  'level:scrub-back': c.object({}),
  'level:show-victory': c.object({
    required: ['showModal']
  }, {
    showModal: {
      type: 'boolean'
    },
    manual: {
      type: 'boolean'
    }
  }),
  'level:highlight-dom': c.object({
    required: ['selector']
  }, {
    selector: {
      type: 'string'
    },
    delay: {
      type: ['number', 'null', 'undefined']
    },
    sides: {
      type: 'array',
      items: {
        'enum': ['left', 'right', 'top', 'bottom']
      }
    },
    offset: {
      type: 'object'
    },
    rotation: {
      type: 'number'
    }
  }),
  'level:end-highlight-dom': c.object({}),
  'level:focus-dom': c.object({}, {
    selector: {
      type: 'string'
    }
  }),
  'level:lock-select': c.object({}, {
    lock: {
      type: ['boolean', 'array']
    }
  }),
  'level:suppress-selection-sounds': c.object({
    required: ['suppress']
  }, {
    suppress: {
      type: 'boolean'
    }
  }),
  'goal-manager:new-goal-states': c.object({
    required: ['goalStates', 'goals', 'overallStatus', 'timedOut']
  }, {
    goalStates: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            oneOf: [
              {
                type: 'null'
              }, {
                type: 'string',
                "enum": ['success', 'failure', 'incomplete']
              }
            ]
          },
          keyFrame: {
            oneOf: [
              {
                type: 'integer',
                minimum: 0
              }, {
                type: 'string',
                "enum": ['end']
              }
            ]
          },
          team: {
            type: ['null', 'string', 'undefined']
          }
        }
      }
    },
    goals: c.array({}, {
      type: 'object'
    }),
    overallStatus: {
      oneOf: [
        {
          type: 'null'
        }, {
          type: 'string',
          "enum": ['success', 'failure', 'incomplete']
        }
      ]
    },
    timedOut: {
      type: 'boolean'
    }
  }),
  'level:hero-config-changed': c.object({}),
  'level:hero-selection-updated': c.object({
    required: ['hero']
  }, {
    hero: {
      type: 'object'
    }
  }),
  'level:subscription-required': c.object({}),
  'level:course-membership-required': c.object({}),
  'level:contact-button-pressed': c.object({
    title: 'Contact Pressed',
    description: 'Dispatched when the contact button is pressed in a level.'
  })
};
});

;require.register("schemas/subscriptions/scripts", function(exports, require, module) {
var c;

c = require('schemas/schemas');

module.exports = {
  'script:end-current-script': c.object({}),
  'script:reset': c.object({}),
  'script:ended': c.object({
    required: ['scriptID']
  }, {
    scriptID: {
      type: 'string'
    }
  }),
  'script:state-changed': c.object({
    required: ['currentScript', 'currentScriptOffset']
  }, {
    currentScript: {
      type: ['string', 'null']
    },
    currentScriptOffset: {
      type: 'integer',
      minimum: 0
    }
  }),
  'script:tick': c.object({
    required: ['scriptRunning', 'noteGroupRunning', 'scriptStates', 'timeSinceLastScriptEnded']
  }, {
    scriptRunning: {
      type: 'string'
    },
    noteGroupRunning: {
      type: 'string'
    },
    timeSinceLastScriptEnded: {
      type: 'number'
    },
    scriptStates: {
      type: 'object',
      additionalProperties: c.object({
        title: 'Script State'
      }, {
        timeSinceLastEnded: {
          type: 'number',
          minimum: 0,
          description: 'seconds since this script ended last'
        },
        timeSinceLastTriggered: {
          type: 'number',
          minimum: 0,
          description: 'seconds since this script was triggered last'
        }
      })
    }
  }),
  'script:note-group-started': c.object({}),
  'script:note-group-ended': c.object({})
};
});

;require.register("schemas/subscriptions/surface", function(exports, require, module) {
var c, spriteMouseEventSchema;

c = require('schemas/schemas');

spriteMouseEventSchema = c.object({
  required: ['sprite', 'thang', 'originalEvent', 'canvas']
}, {
  sprite: {
    type: 'object'
  },
  thang: {
    type: 'object'
  },
  originalEvent: {
    type: 'object'
  },
  canvas: {
    type: 'object'
  }
});

module.exports = {
  'camera:dragged': c.object({}),
  'camera:zoom-in': c.object({}),
  'camera:zoom-out': c.object({}),
  'camera:zoom-to': c.object({
    required: ['pos']
  }, {
    pos: c.object({
      required: ['x', 'y']
    }, {
      x: {
        type: 'number'
      },
      y: {
        type: 'number'
      }
    }),
    duration: {
      type: 'number',
      minimum: 0
    }
  }),
  'camera:zoom-updated': c.object({
    required: ['camera', 'zoom', 'surfaceViewport']
  }, {
    camera: {
      type: 'object'
    },
    zoom: {
      type: 'number',
      minimum: 0,
      exclusiveMinimum: true
    },
    surfaceViewport: {
      type: 'object'
    },
    minZoom: {
      type: 'number',
      minimum: 0,
      exclusiveMinimum: true
    }
  }),
  'camera:set-camera': c.object({}, {
    pos: c.object({
      required: ['x', 'y']
    }, {
      x: {
        type: 'number'
      },
      y: {
        type: 'number'
      }
    }),
    thangID: {
      type: 'string'
    },
    zoom: {
      type: 'number'
    },
    duration: {
      type: 'number',
      minimum: 0
    },
    bounds: c.array({
      maxItems: 2,
      minItems: 2
    }, c.object({
      required: ['x', 'y']
    }, {
      x: {
        type: 'number'
      },
      y: {
        type: 'number'
      }
    }))
  }),
  'sprite:speech-updated': c.object({
    required: ['sprite', 'thang']
  }, {
    sprite: {
      type: 'object'
    },
    thang: {
      type: ['object', 'null']
    },
    blurb: {
      type: ['string', 'null', 'undefined']
    },
    message: {
      type: 'string'
    },
    mood: {
      type: 'string'
    },
    responses: {
      type: ['array', 'null', 'undefined']
    },
    spriteID: {
      type: 'string'
    },
    sound: {
      type: ['null', 'undefined', 'object']
    }
  }),
  'level:sprite-dialogue': c.object({
    required: ['spriteID', 'message']
  }, {
    blurb: {
      type: ['string', 'null', 'undefined']
    },
    message: {
      type: 'string'
    },
    mood: {
      type: 'string'
    },
    responses: {
      type: ['array', 'null', 'undefined']
    },
    spriteID: {
      type: 'string'
    },
    sound: {
      type: ['null', 'undefined', 'object']
    }
  }),
  'sprite:dialogue-sound-completed': c.object({}),
  'level:sprite-clear-dialogue': c.object({}),
  'surface:gold-changed': c.object({
    required: ['team', 'gold']
  }, {
    team: {
      type: 'string'
    },
    gold: {
      type: 'number'
    },
    goldEarned: {
      type: 'number'
    }
  }),
  'surface:coordinate-selected': c.object({
    required: ['x', 'y']
  }, {
    x: {
      type: 'number'
    },
    y: {
      type: 'number'
    },
    z: {
      type: 'number'
    }
  }),
  'surface:coordinates-shown': c.object({}),
  'sprite:loaded': c.object({}, {
    sprite: {
      type: 'object'
    }
  }),
  'surface:choose-point': c.object({
    required: ['point']
  }, {
    point: c.object({
      required: ['x', 'y']
    }, {
      x: {
        type: 'number'
      },
      y: {
        type: 'number'
      },
      z: {
        type: 'number'
      }
    })
  }),
  'surface:choose-region': c.object({
    required: ['points']
  }, {
    points: c.array({
      minItems: 2,
      maxItems: 2
    }, c.object({
      required: ['x', 'y']
    }, {
      x: {
        type: 'number'
      },
      y: {
        type: 'number'
      },
      z: {
        type: 'number'
      }
    }))
  }),
  'surface:new-thang-added': c.object({
    required: ['thang', 'sprite']
  }, {
    thang: {
      type: 'object'
    },
    sprite: {
      type: 'object'
    }
  }),
  'surface:sprite-selected': c.object({
    required: ['thang', 'sprite']
  }, {
    thang: {
      type: ['object', 'null', 'undefined']
    },
    sprite: {
      type: ['object', 'null', 'undefined']
    },
    spellName: {
      type: ['string', 'null', 'undefined']
    },
    originalEvent: {
      type: ['object', 'null', 'undefined']
    },
    worldPos: {
      type: ['object', 'null', 'undefined']
    }
  }),
  'sprite:thang-began-talking': c.object({}, {
    thang: {
      type: 'object'
    }
  }),
  'sprite:thang-finished-talking': c.object({}, {
    thang: {
      type: 'object'
    }
  }),
  'sprite:highlight-sprites': c.object({}, {
    thangIDs: c.array({}, {
      type: 'string'
    }),
    delay: {
      type: ['number', 'null', 'undefined']
    }
  }),
  'sprite:move': c.object({
    required: ['spriteID', 'pos']
  }, {
    spriteID: {
      type: 'string'
    },
    pos: c.object({
      required: ['x', 'y']
    }, {
      x: {
        type: 'number'
      },
      y: {
        type: 'number'
      },
      z: {
        type: 'number'
      }
    }),
    duration: {
      type: 'number',
      minimum: 0
    }
  }),
  'sprite:mouse-down': spriteMouseEventSchema,
  'sprite:clicked': spriteMouseEventSchema,
  'sprite:double-clicked': spriteMouseEventSchema,
  'sprite:dragged': spriteMouseEventSchema,
  'sprite:mouse-up': spriteMouseEventSchema,
  'surface:frame-changed': c.object({
    required: ['frame', 'world', 'progress']
  }, {
    frame: {
      type: 'number',
      minimum: 0
    },
    world: {
      type: 'object'
    },
    progress: {
      type: 'number',
      minimum: 0,
      maximum: 1
    },
    selectedThang: {
      type: ['object', 'null', 'undefined']
    }
  }),
  'surface:playback-ended': c.object({}),
  'surface:playback-restarted': c.object({}),
  'surface:mouse-moved': c.object({
    required: ['x', 'y']
  }, {
    x: {
      type: 'number'
    },
    y: {
      type: 'number'
    }
  }),
  'surface:stage-mouse-down': c.object({
    required: ['onBackground', 'x', 'y', 'originalEvent']
  }, {
    onBackground: {
      type: 'boolean'
    },
    x: {
      type: 'number'
    },
    y: {
      type: 'number'
    },
    originalEvent: {
      type: 'object'
    },
    worldPos: {
      type: ['object', 'null', 'undefined']
    }
  }),
  'surface:stage-mouse-up': c.object({
    required: ['onBackground', 'originalEvent']
  }, {
    onBackground: {
      type: 'boolean'
    },
    x: {
      type: ['number', 'undefined']
    },
    y: {
      type: ['number', 'undefined']
    },
    originalEvent: {
      type: 'object'
    }
  }),
  'surface:mouse-scrolled': c.object({
    required: ['deltaX', 'deltaY', 'canvas']
  }, {
    deltaX: {
      type: 'number'
    },
    deltaY: {
      type: 'number'
    },
    screenPos: c.object({
      required: ['x', 'y']
    }, {
      x: {
        type: 'number'
      },
      y: {
        type: 'number'
      }
    }),
    canvas: {
      type: 'object'
    }
  }),
  'surface:ticked': c.object({
    required: ['dt']
  }, {
    dt: {
      type: 'number'
    }
  }),
  'surface:mouse-over': c.object({}),
  'surface:mouse-out': c.object({}),
  'sprite:echo-all-wizard-sprites': c.object({
    required: ['payload']
  }, {
    payload: c.array({}, {
      type: 'object'
    })
  }),
  'self-wizard:created': c.object({
    required: ['sprite']
  }, {
    sprite: {
      type: 'object'
    }
  }),
  'self-wizard:target-changed': c.object({
    required: ['sprite']
  }, {
    sprite: {
      type: 'object'
    }
  }),
  'surface:flag-appeared': c.object({
    required: ['sprite']
  }, {
    sprite: {
      type: 'object'
    }
  }),
  'surface:remove-selected-flag': c.object({}),
  'surface:remove-flag': c.object({
    required: ['color']
  }, {
    color: {
      type: 'string'
    }
  })
};
});

;require.register("schemas/subscriptions/tome", function(exports, require, module) {
var c;

c = require('schemas/schemas');

module.exports = {
  'tome:cast-spell': c.object({
    title: 'Cast Spell',
    description: 'Published when a spell is cast',
    required: []
  }, {
    spell: {
      type: 'object'
    },
    thang: {
      type: 'object'
    },
    preload: {
      type: 'boolean'
    },
    realTime: {
      type: 'boolean'
    },
    justBegin: {
      type: 'boolean'
    }
  }),
  'tome:cast-spells': c.object({
    title: 'Cast Spells',
    description: 'Published when spells are cast',
    required: ['spells', 'preload', 'realTime', 'submissionCount', 'flagHistory', 'difficulty', 'god']
  }, {
    spells: {
      type: 'object'
    },
    preload: {
      type: 'boolean'
    },
    realTime: {
      type: 'boolean'
    },
    submissionCount: {
      type: 'integer'
    },
    fixedSeed: {
      type: ['integer', 'undefined']
    },
    flagHistory: {
      type: 'array'
    },
    difficulty: {
      type: 'integer'
    },
    god: {
      type: 'object'
    },
    justBegin: {
      type: 'boolean'
    }
  }),
  'tome:manual-cast': c.object({
    title: 'Manually Cast Spells',
    description: 'Published when you wish to manually recast all spells',
    required: []
  }, {
    realTime: {
      type: 'boolean'
    }
  }),
  'tome:manual-cast-denied': c.object({
    title: 'Manual Cast Denied',
    description: 'Published when player attempts to submit for real-time playback, but must wait after a replayable level failure.',
    required: ['timeUntilResubmit']
  }, {
    timeUntilResubmit: {
      type: 'number'
    }
  }),
  'tome:spell-created': c.object({
    title: 'Spell Created',
    description: 'Published after a new spell has been created',
    required: ['spell']
  }, {
    spell: {
      type: 'object'
    }
  }),
  'tome:spell-has-changed-significantly-calculation': c.object({
    title: 'Has Changed Significantly Calculation',
    description: 'Let anyone know that the spell has changed significantly.',
    required: ['hasChangedSignificantly']
  }, {
    hasChangedSignificantly: {
      type: 'boolean'
    }
  }),
  'tome:spell-debug-property-hovered': c.object({
    title: 'Spell Debug Property Hovered',
    description: 'Published when you hover over a spell property',
    required: []
  }, {
    property: {
      type: 'string'
    },
    owner: {
      type: 'string'
    }
  }),
  'tome:spell-debug-value-request': c.object({
    title: 'Spell Debug Value Request',
    description: 'Published when the SpellDebugView wants to retrieve a debug value.',
    required: ['thangID', 'spellID', 'variableChain', 'frame']
  }, {
    thangID: {
      type: 'string'
    },
    spellID: {
      type: 'string'
    },
    variableChain: c.array({}, {
      type: 'string'
    }),
    frame: {
      type: 'integer',
      minimum: 0
    }
  }),
  'tome:reload-code': c.object({
    title: 'Reload Code',
    description: 'Published when you reset a spell to its original source',
    required: []
  }, {
    spell: {
      type: 'object'
    }
  }),
  'tome:palette-cleared': c.object({
    title: 'Palette Cleared',
    description: 'Published when the spell palette is about to be cleared and recreated.'
  }, {
    thangID: {
      type: 'string'
    }
  }),
  'tome:palette-updated': c.object({
    title: 'Palette Updated',
    description: 'Published when the spell palette has just been updated.'
  }, {
    thangID: {
      type: 'string'
    },
    entryGroups: {
      type: 'string'
    }
  }),
  'tome:palette-hovered': c.object({
    title: 'Palette Hovered',
    description: 'Published when you hover over a Thang in the spell palette',
    required: ['thang', 'prop', 'entry']
  }, {
    thang: {
      type: 'object'
    },
    prop: {
      type: 'string'
    },
    entry: {
      type: 'object'
    }
  }),
  'tome:palette-pin-toggled': c.object({
    title: 'Palette Pin Toggled',
    description: 'Published when you pin or unpin the spell palette',
    required: ['entry', 'pinned']
  }, {
    entry: {
      type: 'object'
    },
    pinned: {
      type: 'boolean'
    }
  }),
  'tome:palette-clicked': c.object({
    title: 'Palette Clicked',
    description: 'Published when you click on the spell palette',
    required: ['thang', 'prop', 'entry']
  }, {
    thang: {
      type: 'object'
    },
    prop: {
      type: 'string'
    },
    entry: {
      type: 'object'
    }
  }),
  'tome:spell-statement-index-updated': c.object({
    title: 'Spell Statement Index Updated',
    description: 'Published when the spell index is updated',
    required: ['statementIndex', 'ace']
  }, {
    statementIndex: {
      type: 'integer'
    },
    ace: {
      type: 'object'
    }
  }),
  'tome:spell-beautify': c.object({
    title: 'Beautify',
    description: 'Published when you click the \'beautify\' button',
    required: []
  }, {
    spell: {
      type: 'object'
    }
  }),
  'tome:spell-step-forward': c.object({
    title: 'Step Forward',
    description: 'Published when you step forward in time'
  }),
  'tome:spell-step-backward': c.object({
    title: 'Step Backward',
    description: 'Published when you step backward in time'
  }),
  'tome:spell-loaded': c.object({
    title: 'Spell Loaded',
    description: 'Published when a spell is loaded',
    required: ['spell']
  }, {
    spell: {
      type: 'object'
    }
  }),
  'tome:spell-changed': c.object({
    title: 'Spell Changed',
    description: 'Published when a spell is changed',
    required: ['spell']
  }, {
    spell: {
      type: 'object'
    }
  }),
  'tome:editing-began': c.object({
    title: 'Editing Began',
    description: 'Published when you have begun changing code'
  }),
  'tome:editing-ended': c.object({
    title: 'Editing Ended',
    description: 'Published when you have stopped changing code'
  }),
  'tome:problems-updated': c.object({
    title: 'Problems Updated',
    description: 'Published when problems have been updated',
    required: ['spell', 'problems', 'isCast']
  }, {
    spell: {
      type: 'object'
    },
    problems: {
      type: 'array'
    },
    isCast: {
      type: 'boolean',
      description: 'Whether the code has been Run yet. Sometimes determines if error displays as just annotation or as full banner.'
    }
  }),
  'tome:change-language': c.object({
    title: 'Tome Change Language',
    description: 'Published when the Tome should update its programming language',
    required: ['language']
  }, {
    language: {
      type: 'string'
    },
    reload: {
      type: 'boolean',
      description: 'Whether player code should reload to the default when the language changes.'
    }
  }),
  'tome:spell-changed-language': c.object({
    title: 'Spell Changed Language',
    description: 'Published when an individual spell has updated its code language',
    required: ['spell']
  }, {
    spell: {
      type: 'object'
    },
    language: {
      type: 'string'
    }
  }),
  'tome:comment-my-code': c.object({
    title: 'Comment My Code',
    description: 'Published when we comment out a chunk of your code'
  }),
  'tome:change-config': c.object({
    title: 'Change Config',
    description: 'Published when you change your tome settings'
  }),
  'tome:update-snippets': c.object({
    title: 'Update Snippets',
    description: 'Published when we need to add autocomplete snippets',
    required: ['propGroups', 'allDocs']
  }, {
    propGroups: {
      type: 'object'
    },
    allDocs: {
      type: 'object'
    },
    language: {
      type: 'string'
    }
  }),
  'tome:insert-snippet': c.object({
    title: 'Insert Snippet',
    description: 'Published when we need to insert a autocomplete snippet',
    required: ['doc', 'language', 'formatted']
  }, {
    doc: {
      type: 'object'
    },
    language: {
      type: 'string'
    },
    formatted: {
      type: 'object'
    }
  }),
  'tome:focus-editor': c.object({
    title: 'Focus Editor',
    description: 'Published whenever we want to give focus back to the editor'
  }),
  'tome:toggle-maximize': c.object({
    title: 'Toggle Maximize',
    description: 'Published when we want to make the Tome take up most of the screen'
  }),
  'tome:maximize-toggled': c.object({
    title: 'Maximize Toggled',
    description: 'Published when the Tome has changed maximize/minimize state.'
  }),
  'tome:select-primary-sprite': c.object({
    title: 'Select Primary Sprite',
    description: 'Published to get the most important sprite\'s code selected.'
  }),
  'tome:required-code-fragment-deleted': c.object({
    title: 'Required Code Fragment Deleted',
    description: 'Published when a required code fragment is deleted from the sample code.',
    required: ['codeFragment']
  }, {
    codeFragment: {
      type: 'string'
    }
  }),
  'tome:suspect-code-fragment-added': c.object({
    title: 'Suspect Code Fragment Added',
    description: 'Published when a suspect code fragment is added to the sample code.',
    required: ['codeFragment']
  }, {
    codeFragment: {
      type: 'string'
    },
    codeLanguage: {
      type: 'string'
    }
  }),
  'tome:suspect-code-fragment-deleted': c.object({
    title: 'Suspect Code Fragment Deleted',
    description: 'Published when a suspect code fragment is deleted from the sample code.',
    required: ['codeFragment']
  }, {
    codeFragment: {
      type: 'string'
    },
    codeLanguage: {
      type: 'string'
    }
  }),
  'tome:winnability-updated': c.object({
    title: 'Winnability Updated',
    description: 'When we think we can now win (or can no longer win), we may want to emphasize the submit button versus the run button (or vice versa), so this fires when we get new goal states (even preloaded goal states) suggesting success or failure change.',
    required: ['winnable']
  }, {
    winnable: {
      type: 'boolean'
    },
    level: {
      type: 'object'
    }
  }),
  'tome:show-problem-alert': c.object({
    title: 'Show Problem Alert',
    description: 'A problem alert needs to be shown.',
    required: ['problem']
  }, {
    problem: {
      type: 'object'
    },
    lineOffsetPx: {
      type: ['number', 'undefined']
    }
  }),
  'tome:hide-problem-alert': c.object({
    title: 'Hide Problem Alert'
  }),
  'tome:jiggle-problem-alert': c.object({
    title: 'Jiggle Problem Alert'
  }),
  'tome:html-updated': c.object({
    title: 'HTML Updated',
    required: ['html', 'create']
  }, {
    html: {
      type: 'string',
      description: 'The full HTML to display'
    },
    create: {
      type: 'boolean',
      description: 'Whether we should (re)create the DOM (as opposed to updating it)'
    }
  })
};
});

;require.register("schemas/subscriptions/web-dev", function(exports, require, module) {
var c;

c = require('schemas/schemas');

module.exports = {
  'web-dev:error': c.object({
    title: 'Web Dev Error',
    description: 'Published when an uncaught error occurs in the web-dev iFrame',
    required: []
  }, {
    message: {
      type: 'string'
    },
    url: {
      type: 'string',
      description: 'URL of the host iFrame'
    },
    line: {
      type: 'integer',
      description: 'Line number of the start of the code that threw the exception (relative to its <script> tag!)'
    },
    column: {
      type: 'integer',
      description: 'Column number of the start of the code that threw the exception'
    },
    error: {
      type: 'string',
      description: 'The .toString of the originally thrown exception'
    }
  }),
  'web-dev:hover-line': c.object({
    title: 'Web-dev Hover Line',
    description: 'Published when the user is hovering over a line of code, for the purposes of highlighting nodes based on the hovered CSS selector'
  }, {
    row: {
      type: 'integer',
      description: 'The row number of the hovered line (zero-indexed!)'
    },
    line: {
      type: 'string',
      description: 'The full line of code that the user is hovering over'
    },
    'web-dev:stop-hovering-line': c.object({
      title: 'Stop hovering line',
      description: 'Published when the user is no longer hovering over a line of code with their mouse.'
    })
  })
};
});

;require.register("schemas/subscriptions/world", function(exports, require, module) {
var c;

c = require('schemas/schemas');

module.exports = {
  'world:won': c.object({}, {
    replacedNoteChain: {
      type: 'array'
    }
  }),
  'world:thang-died': c.object({
    required: ['thang', 'killer']
  }, {
    replacedNoteChain: {
      type: 'array'
    },
    thang: {
      type: 'object'
    },
    killer: {
      type: 'object'
    },
    killerHealth: {
      type: ['number', 'undefined']
    },
    maxHealth: {
      type: 'number'
    }
  }),
  'world:thang-touched-goal': c.object({
    required: ['actor', 'touched']
  }, {
    replacedNoteChain: {
      type: 'array'
    },
    thang: {
      type: 'object'
    },
    actor: {
      type: 'object'
    },
    touched: {
      type: 'object'
    }
  }),
  'world:thang-collected-item': c.object({
    required: ['actor', 'item']
  }, {
    replacedNoteChain: {
      type: 'array'
    },
    thang: {
      type: 'object'
    },
    actor: {
      type: 'object'
    },
    item: {
      type: 'object'
    }
  }),
  'world:thang-finished-plans': c.object({
    required: ['thang']
  }, {
    replacedNoteChain: {
      type: 'array'
    },
    thang: {
      type: 'object'
    }
  }),
  'world:attacked-when-out-of-range': c.object({
    required: ['thang']
  }, {
    replacedNoteChain: {
      type: 'array'
    },
    thang: {
      type: 'object'
    }
  }),
  'world:custom-script-trigger': {
    type: 'object'
  },
  'world:user-code-problem': c.object({
    required: ['thang', 'problem']
  }, {
    thang: {
      type: 'object'
    },
    problem: c.object({
      required: ['message', 'level', 'type']
    }, {
      userInfo: {
        type: 'object'
      },
      message: {
        type: 'string'
      },
      level: {
        type: 'string',
        "enum": ['info', 'warning', 'error']
      },
      type: {
        type: 'string'
      },
      error: {
        type: 'object'
      }
    })
  }),
  'world:lines-of-code-counted': c.object({
    required: ['thang', 'linesUsed']
  }, {
    thang: {
      type: 'object'
    },
    linesUsed: {
      type: 'integer'
    }
  })
};
});

;require.register("models/Achievement", function(exports, require, module) {
var Achievement, CocoModel, utils,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

utils = require('../core/utils');

module.exports = Achievement = (function(superClass) {
  extend(Achievement, superClass);

  function Achievement() {
    return Achievement.__super__.constructor.apply(this, arguments);
  }

  Achievement.className = 'Achievement';

  Achievement.schema = require('schemas/models/achievement');

  Achievement.prototype.urlRoot = '/db/achievement';

  Achievement.prototype.editableByArtisans = true;

  Achievement.prototype.isRepeatable = function() {
    return this.get('proportionalTo') != null;
  };

  Achievement.prototype.getExpFunction = function() {
    var func;
    func = this.get('function', true);
    if (func.kind in utils.functionCreators) {
      return utils.functionCreators[func.kind](func.parameters);
    }
  };

  Achievement.prototype.save = function() {
    this.populateI18N();
    return Achievement.__super__.save.apply(this, arguments);
  };

  Achievement.styleMapping = {
    1: 'achievement-wood',
    2: 'achievement-stone',
    3: 'achievement-silver',
    4: 'achievement-gold',
    5: 'achievement-diamond'
  };

  Achievement.prototype.getStyle = function() {
    return Achievement.styleMapping[this.get('difficulty', true)];
  };

  Achievement.defaultImageURL = '/images/achievements/default.png';

  Achievement.prototype.getImageURL = function() {
    if (this.get('icon')) {
      return '/file/' + this.get('icon');
    } else {
      return Achievement.defaultImageURL;
    }
  };

  Achievement.prototype.hasImage = function() {
    return this.get('icon') != null;
  };

  Achievement.prototype.cacheLockedImage = function() {
    var canvas, defer, image;
    if (this.lockedImageURL) {
      return this.lockedImageURL;
    }
    canvas = document.createElement('canvas');
    image = new Image;
    image.src = this.getImageURL();
    defer = $.Deferred();
    image.onload = (function(_this) {
      return function() {
        var context, imgData;
        canvas.width = image.width;
        canvas.height = image.height;
        context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        imgData = context.getImageData(0, 0, canvas.width, canvas.height);
        imgData = utils.grayscale(imgData);
        context.putImageData(imgData, 0, 0);
        _this.lockedImageURL = canvas.toDataURL();
        return defer.resolve(_this.lockedImageURL);
      };
    })(this);
    return defer;
  };

  Achievement.prototype.getLockedImageURL = function() {
    return this.lockedImageURL;
  };

  Achievement.prototype.i18nName = function() {
    return utils.i18n(this.attributes, 'name');
  };

  Achievement.prototype.i18nDescription = function() {
    return utils.i18n(this.attributes, 'description');
  };

  return Achievement;

})(CocoModel);
});

;require.register("models/AnalyticsLogEvent", function(exports, require, module) {
var AnalyticsLogEvent, CocoModel,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

module.exports = AnalyticsLogEvent = (function(superClass) {
  extend(AnalyticsLogEvent, superClass);

  function AnalyticsLogEvent() {
    return AnalyticsLogEvent.__super__.constructor.apply(this, arguments);
  }

  AnalyticsLogEvent.className = 'AnalyticsLogEvent';

  AnalyticsLogEvent.schema = require('schemas/models/analytics_log_event');

  AnalyticsLogEvent.prototype.urlRoot = '/db/analytics.log.event';

  return AnalyticsLogEvent;

})(CocoModel);
});

;require.register("models/AnalyticsStripeInvoice", function(exports, require, module) {
var AnalyticsStripeInvoice, CocoModel,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

module.exports = AnalyticsStripeInvoice = (function(superClass) {
  extend(AnalyticsStripeInvoice, superClass);

  function AnalyticsStripeInvoice() {
    return AnalyticsStripeInvoice.__super__.constructor.apply(this, arguments);
  }

  AnalyticsStripeInvoice.className = 'AnalyticsStripeInvoice';

  AnalyticsStripeInvoice.schema = require('schemas/models/analytics_stripe_invoice');

  AnalyticsStripeInvoice.prototype.urlRoot = '/db/analytics.stripe.invoice';

  return AnalyticsStripeInvoice;

})(CocoModel);
});

;require.register("models/Article", function(exports, require, module) {
var Article, CocoModel,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

module.exports = Article = (function(superClass) {
  extend(Article, superClass);

  function Article() {
    return Article.__super__.constructor.apply(this, arguments);
  }

  Article.className = 'Article';

  Article.schema = require('schemas/models/article');

  Article.prototype.urlRoot = '/db/article';

  Article.prototype.saveBackups = true;

  Article.prototype.editableByArtisans = true;

  return Article;

})(CocoModel);
});

;require.register("models/Campaign", function(exports, require, module) {
var Campaign, CocoCollection, CocoModel, Level, Levels, schema, utils,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

schema = require('schemas/models/campaign.schema');

Level = require('models/Level');

Levels = require('collections/Levels');

CocoCollection = require('collections/CocoCollection');

utils = require('../core/utils');

module.exports = Campaign = (function(superClass) {
  extend(Campaign, superClass);

  function Campaign() {
    return Campaign.__super__.constructor.apply(this, arguments);
  }

  Campaign.className = 'Campaign';

  Campaign.schema = schema;

  Campaign.prototype.urlRoot = '/db/campaign';

  Campaign.denormalizedLevelProperties = _.keys(_.omit(schema.properties.levels.additionalProperties.properties, ['unlocks', 'position', 'rewards']));

  Campaign.denormalizedCampaignProperties = ['name', 'i18n', 'slug'];

  Campaign.prototype.getLevels = function() {
    var levels;
    levels = new Levels(_.values(this.get('levels')));
    levels.comparator = 'campaignIndex';
    levels.sort();
    return levels;
  };

  Campaign.prototype.getNonLadderLevels = function() {
    var levels;
    levels = new Levels(_.values(this.get('levels')));
    levels.reset(levels.reject(function(level) {
      return level.isLadder();
    }));
    levels.comparator = 'campaignIndex';
    levels.sort();
    return levels;
  };

  Campaign.prototype.getLevelNumber = function(levelID, defaultNumber) {
    var i, len, level, levels, ref, ref1, ref2;
    if (!this.levelNumberMap) {
      levels = [];
      ref = this.getLevels().models;
      for (i = 0, len = ref.length; i < len; i++) {
        level = ref[i];
        if (level.get('original')) {
          levels.push({
            key: level.get('original'),
            practice: (ref1 = level.get('practice')) != null ? ref1 : false
          });
        }
      }
      this.levelNumberMap = utils.createLevelNumberMap(levels);
    }
    return (ref2 = this.levelNumberMap[levelID]) != null ? ref2 : defaultNumber;
  };

  return Campaign;

})(CocoModel);
});

;require.register("models/Clan", function(exports, require, module) {
var Clan, CocoModel, schema,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

schema = require('schemas/models/clan.schema');

module.exports = Clan = (function(superClass) {
  extend(Clan, superClass);

  function Clan() {
    return Clan.__super__.constructor.apply(this, arguments);
  }

  Clan.className = 'Clan';

  Clan.schema = schema;

  Clan.prototype.urlRoot = '/db/clan';

  return Clan;

})(CocoModel);
});

;require.register("models/Classroom", function(exports, require, module) {
var Classroom, CocoModel, User, schema, utils,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

schema = require('schemas/models/classroom.schema');

utils = require('../core/utils');

User = require('models/User');

module.exports = Classroom = (function(superClass) {
  extend(Classroom, superClass);

  function Classroom() {
    return Classroom.__super__.constructor.apply(this, arguments);
  }

  Classroom.className = 'Classroom';

  Classroom.schema = schema;

  Classroom.prototype.urlRoot = '/db/classroom';

  Classroom.prototype.initialize = function() {
    this.listenTo(this, 'change:aceConfig', this.capitalizeLanguageName);
    return Classroom.__super__.initialize.apply(this, arguments);
  };

  Classroom.prototype.parse = function(obj) {
    if (obj._id) {
      return obj;
    } else {
      this.owner = new User(obj.owner);
      return obj.data;
    }
  };

  Classroom.prototype.capitalizeLanguageName = function() {
    var language, ref;
    language = (ref = this.get('aceConfig')) != null ? ref.language : void 0;
    return this.capitalLanguage = utils.capitalLanguages[language];
  };

  Classroom.prototype.joinWithCode = function(code, opts) {
    var options;
    options = {
      url: this.urlRoot + '/~/members',
      type: 'POST',
      data: {
        code: code
      },
      success: (function(_this) {
        return function() {
          return _this.trigger('join:success');
        };
      })(this),
      error: (function(_this) {
        return function() {
          return _this.trigger('join:error');
        };
      })(this)
    };
    _.extend(options, opts);
    return this.fetch(options);
  };

  Classroom.prototype.fetchByCode = function(code, opts) {
    var options;
    options = {
      url: _.result(this, 'url'),
      data: {
        code: code,
        "with-owner": true
      }
    };
    _.extend(options, opts);
    return this.fetch(options);
  };

  Classroom.prototype.getLevelNumber = function(levelID, defaultNumber) {
    var course, i, j, language, len, len1, level, levels, ref, ref1, ref2, ref3, ref4, ref5;
    if (!this.levelNumberMap) {
      this.levelNumberMap = {};
      language = (ref = this.get('aceConfig')) != null ? ref.language : void 0;
      ref2 = (ref1 = this.get('courses')) != null ? ref1 : [];
      for (i = 0, len = ref2.length; i < len; i++) {
        course = ref2[i];
        levels = [];
        ref3 = course.levels;
        for (j = 0, len1 = ref3.length; j < len1; j++) {
          level = ref3[j];
          if (!level.original) {
            continue;
          }
          if ((language != null) && level.primerLanguage === language) {
            continue;
          }
          levels.push({
            key: level.original,
            practice: (ref4 = level.practice) != null ? ref4 : false
          });
        }
        _.assign(this.levelNumberMap, utils.createLevelNumberMap(levels));
      }
    }
    return (ref5 = this.levelNumberMap[levelID]) != null ? ref5 : defaultNumber;
  };

  Classroom.prototype.removeMember = function(userID, opts) {
    var options;
    options = {
      url: _.result(this, 'url') + '/members',
      type: 'DELETE',
      data: {
        userID: userID
      }
    };
    _.extend(options, opts);
    return this.fetch(options);
  };

  Classroom.prototype.setStudentPassword = function(student, password, options) {
    var classroomID;
    classroomID = this.id;
    return $.ajax({
      url: "/db/classroom/" + classroomID + "/members/" + student.id + "/reset-password",
      method: 'POST',
      data: {
        password: password
      },
      success: (function(_this) {
        return function() {
          return _this.trigger('save-password:success');
        };
      })(this),
      error: (function(_this) {
        return function(response) {
          return _this.trigger('save-password:error', response.responseJSON);
        };
      })(this)
    });
  };

  Classroom.prototype.getLevels = function(options) {
    var Levels, course, courses, i, language, len, levelObjects, levels, ref;
    if (options == null) {
      options = {};
    }
    Levels = require('collections/Levels');
    courses = this.get('courses');
    if (!courses) {
      return new Levels();
    }
    levelObjects = [];
    for (i = 0, len = courses.length; i < len; i++) {
      course = courses[i];
      if (options.courseID && options.courseID !== course._id) {
        continue;
      }
      levelObjects.push(course.levels);
    }
    levels = new Levels(_.flatten(levelObjects));
    language = (ref = this.get('aceConfig')) != null ? ref.language : void 0;
    if (language) {
      levels.remove(levels.filter((function(_this) {
        return function(level) {
          return level.get('primerLanguage') === language;
        };
      })(this)));
    }
    if (options.withoutLadderLevels) {
      levels.remove(levels.filter(function(level) {
        return level.isLadder();
      }));
    }
    if (options.projectLevels) {
      levels.remove(levels.filter(function(level) {
        return level.get('shareable') !== 'project';
      }));
    }
    return levels;
  };

  Classroom.prototype.getLadderLevel = function(courseID) {
    var Levels, course, courses, levels;
    Levels = require('collections/Levels');
    courses = this.get('courses');
    course = _.findWhere(courses, {
      _id: courseID
    });
    if (!course) {
      return;
    }
    levels = new Levels(course.levels);
    return levels.find(function(l) {
      return l.isLadder();
    });
  };

  Classroom.prototype.getProjectLevel = function(courseID) {
    var Levels, course, courses, levels;
    Levels = require('collections/Levels');
    courses = this.get('courses');
    course = _.findWhere(courses, {
      _id: courseID
    });
    if (!course) {
      return;
    }
    levels = new Levels(course.levels);
    return levels.find(function(l) {
      return l.isProject();
    });
  };

  Classroom.prototype.statsForSessions = function(sessions, courseID) {
    var arena, complete, courseLevels, currentIndex, currentLevel, currentPlaytime, i, index, j, lastPlayed, lastPlayedNumber, lastStarted, len, len1, level, levelSessionMap, levels, levelsLeft, levelsTotal, needsPractice, nextIndex, nextLevel, playtime, project, ref, ref1, ref2, ref3, ref4, ref5, session, stats;
    if (!sessions) {
      return null;
    }
    sessions = sessions.models || sessions;
    arena = this.getLadderLevel(courseID);
    project = this.getProjectLevel(courseID);
    courseLevels = this.getLevels({
      courseID: courseID,
      withoutLadderLevels: true
    });
    levelSessionMap = {};
    for (i = 0, len = sessions.length; i < len; i++) {
      session = sessions[i];
      levelSessionMap[session.get('level').original] = session;
    }
    currentIndex = -1;
    lastStarted = null;
    levelsTotal = 0;
    levelsLeft = 0;
    lastPlayed = null;
    playtime = 0;
    levels = [];
    ref = courseLevels.models;
    for (index = j = 0, len1 = ref.length; j < len1; index = ++j) {
      level = ref[index];
      if (!level.get('practice')) {
        levelsTotal++;
      }
      complete = false;
      if (session = levelSessionMap[level.get('original')]) {
        complete = (ref1 = session.get('state').complete) != null ? ref1 : false;
        playtime += (ref2 = session.get('playtime')) != null ? ref2 : 0;
        lastPlayed = level;
        lastPlayedNumber = index + 1;
        if (complete) {
          currentIndex = index;
        } else {
          lastStarted = level;
          if (!level.get('practice')) {
            levelsLeft++;
          }
        }
      } else if (!level.get('practice')) {
        levelsLeft++;
      }
      levels.push({
        practice: (ref3 = level.get('practice')) != null ? ref3 : false,
        complete: complete
      });
    }
    lastPlayed = lastStarted != null ? lastStarted : lastPlayed;
    needsPractice = false;
    nextIndex = 0;
    if (currentIndex >= 0) {
      currentLevel = courseLevels.models[currentIndex];
      currentPlaytime = (ref4 = (ref5 = levelSessionMap[currentLevel.get('original')]) != null ? ref5.get('playtime') : void 0) != null ? ref4 : 0;
      needsPractice = utils.needsPractice(currentPlaytime, currentLevel.get('practiceThresholdMinutes'));
      nextIndex = utils.findNextLevel(levels, currentIndex, needsPractice);
    }
    nextLevel = courseLevels.models[nextIndex];
    if (nextLevel == null) {
      nextLevel = _.find(courseLevels.models, function(level) {
        var ref6, ref7;
        return !((ref6 = levelSessionMap[level.get('original')]) != null ? (ref7 = ref6.get('state')) != null ? ref7.complete : void 0 : void 0);
      });
    }
    stats = {
      levels: {
        size: levelsTotal,
        left: levelsLeft,
        done: levelsLeft === 0,
        numDone: levelsTotal - levelsLeft,
        pctDone: (100 * (levelsTotal - levelsLeft) / levelsTotal).toFixed(1) + '%',
        lastPlayed: lastPlayed,
        lastPlayedNumber: lastPlayedNumber != null ? lastPlayedNumber : 1,
        next: nextLevel,
        first: courseLevels.first(),
        arena: arena,
        project: project
      },
      playtime: playtime
    };
    return stats;
  };

  Classroom.prototype.fetchForCourseInstance = function(courseInstanceID, options) {
    var CourseInstance, courseInstance;
    if (options == null) {
      options = {};
    }
    if (!courseInstanceID) {
      return;
    }
    CourseInstance = require('models/CourseInstance');
    courseInstance = _.isString(courseInstanceID) ? new CourseInstance({
      _id: courseInstanceID
    }) : courseInstanceID;
    options = _.extend(options, {
      url: _.result(courseInstance, 'url') + '/classroom'
    });
    return this.fetch(options);
  };

  Classroom.prototype.inviteMembers = function(emails, options) {
    if (options == null) {
      options = {};
    }
    if (options.data == null) {
      options.data = {};
    }
    options.data.emails = emails;
    options.url = this.url() + '/invite-members';
    options.type = 'POST';
    return this.fetch(options);
  };

  Classroom.prototype.getSortedCourses = function() {
    var ref;
    return utils.sortCourses((ref = this.get('courses')) != null ? ref : []);
  };

  Classroom.prototype.updateCourses = function(options) {
    if (options == null) {
      options = {};
    }
    options.url = this.url() + '/update-courses';
    options.type = 'POST';
    return this.fetch(options);
  };

  return Classroom;

})(CocoModel);
});

;require.register("models/CocoModel", function(exports, require, module) {
var CocoModel, deltasLib, locale, storage,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

storage = require('core/storage');

deltasLib = require('core/deltas');

locale = require('locale/locale');

CocoModel = (function(superClass) {
  extend(CocoModel, superClass);

  function CocoModel() {
    return CocoModel.__super__.constructor.apply(this, arguments);
  }

  CocoModel.prototype.idAttribute = '_id';

  CocoModel.prototype.loaded = false;

  CocoModel.prototype.loading = false;

  CocoModel.prototype.saveBackups = false;

  CocoModel.prototype.notyErrors = true;

  CocoModel.schema = null;

  CocoModel.prototype.initialize = function(attributes, options) {
    var ref, ref1, ref2;
    CocoModel.__super__.initialize.apply(this, arguments);
    if (options == null) {
      options = {};
    }
    this.setProjection(options.project);
    if (!this.constructor.className) {
      console.error(this + " needs a className set.");
    }
    this.on('sync', this.onLoaded, this);
    this.on('error', this.onError, this);
    this.on('add', this.onLoaded, this);
    this.saveBackup = _.debounce(this.saveBackup, 500);
    this.usesVersions = ((ref = this.schema()) != null ? (ref1 = ref.properties) != null ? ref1.version : void 0 : void 0) != null;
    if ((ref2 = window.application) != null ? ref2.testing : void 0) {
      this.fakeRequests = [];
      return this.on('request', function() {
        return this.fakeRequests.push(jasmine.Ajax.requests.mostRecent());
      });
    }
  };

  CocoModel.prototype.created = function() {
    return new Date(parseInt(this.id.substring(0, 8), 16) * 1000);
  };

  CocoModel.prototype.backupKey = function() {
    if (this.usesVersions) {
      return this.id;
    } else {
      return this.id;
    }
  };

  CocoModel.prototype.setProjection = function(project) {
    var url;
    if (project === this.project) {
      return;
    }
    url = this.getURL();
    if (!/project=/.test(url)) {
      url += '&project=';
    }
    if (!/\?/.test(url)) {
      url = url.replace('&', '?');
    }
    url = url.replace(/project=[^&]*/, "project=" + ((project != null ? project.join(',') : void 0) || ''));
    if (!(project != null ? project.length : void 0)) {
      url = url.replace(/[&?]project=&/, '&');
    }
    if (!(project != null ? project.length : void 0)) {
      url = url.replace(/[&?]project=$/, '');
    }
    this.setURL(url);
    return this.project = project;
  };

  CocoModel.prototype.type = function() {
    return this.constructor.className;
  };

  CocoModel.prototype.clone = function(withChanges) {
    var clone;
    if (withChanges == null) {
      withChanges = true;
    }
    clone = CocoModel.__super__.clone.call(this);
    clone.set($.extend(true, {}, withChanges ? this.attributes : this._revertAttributes));
    return clone;
  };

  CocoModel.prototype.onError = function(level, jqxhr) {
    this.loading = false;
    this.jqxhr = null;
    if (jqxhr.status === 402) {
      if (_.contains(jqxhr.responseText, 'be in a course')) {
        return Backbone.Mediator.publish('level:course-membership-required', {});
      } else {
        return Backbone.Mediator.publish('level:subscription-required', {});
      }
    }
  };

  CocoModel.prototype.onLoaded = function() {
    this.loaded = true;
    this.loading = false;
    this.jqxhr = null;
    return this.loadFromBackup();
  };

  CocoModel.prototype.getCreationDate = function() {
    return new Date(parseInt(this.id.slice(0, 8), 16) * 1000);
  };

  CocoModel.prototype.getNormalizedURL = function() {
    return this.urlRoot + "/" + this.id;
  };

  CocoModel.prototype.attributesWithDefaults = void 0;

  CocoModel.prototype.get = function(attribute, withDefault) {
    if (withDefault == null) {
      withDefault = false;
    }
    if (withDefault) {
      if (this.attributesWithDefaults === void 0) {
        this.buildAttributesWithDefaults();
      }
      return this.attributesWithDefaults[attribute];
    } else {
      return CocoModel.__super__.get.call(this, attribute);
    }
  };

  CocoModel.prototype.set = function(attributes, options) {
    var inFlux, res;
    if (attributes !== 'thangs') {
      delete this.attributesWithDefaults;
    }
    inFlux = this.loading || !this.loaded;
    if (!(inFlux || this._revertAttributes || this.project || (options != null ? options.fromMerge : void 0))) {
      this.markToRevert();
    }
    res = CocoModel.__super__.set.call(this, attributes, options);
    if (this.saveBackups && (!inFlux)) {
      this.saveBackup();
    }
    return res;
  };

  CocoModel.prototype.buildAttributesWithDefaults = function() {
    var clone, duration, t0, thisTV4;
    t0 = new Date();
    clone = $.extend(true, {}, this.attributes);
    thisTV4 = tv4.freshApi();
    thisTV4.addSchema('#', this.schema());
    thisTV4.addSchema('metaschema', require('schemas/metaschema'));
    TreemaUtils.populateDefaults(clone, this.schema(), thisTV4);
    this.attributesWithDefaults = clone;
    duration = new Date() - t0;
    if (duration > 10) {
      return console.debug("Populated defaults for " + (this.type()) + (this.attributes.name ? ' ' + this.attributes.name : '') + " in " + duration + "ms");
    }
  };

  CocoModel.prototype.loadFromBackup = function() {
    var existing;
    if (!this.saveBackups) {
      return;
    }
    existing = storage.load(this.backupKey());
    if (existing) {
      this.set(existing, {
        silent: true
      });
      return CocoModel.backedUp[this.backupKey()] = this;
    }
  };

  CocoModel.prototype.saveBackup = function() {
    return this.saveBackupNow();
  };

  CocoModel.prototype.saveBackupNow = function() {
    storage.save(this.backupKey(), this.attributes);
    return CocoModel.backedUp[this.backupKey()] = this;
  };

  CocoModel.backedUp = {};

  CocoModel.prototype.schema = function() {
    return this.constructor.schema;
  };

  CocoModel.prototype.getValidationErrors = function() {
    var definedAttributes, errors;
    definedAttributes = _.pick(this.attributes, function(v) {
      return v !== void 0;
    });
    errors = tv4.validateMultiple(definedAttributes, this.constructor.schema || {}).errors;
    if (errors != null ? errors.length : void 0) {
      return errors;
    }
  };

  CocoModel.prototype.validate = function() {
    var error, errors, i, len;
    errors = this.getValidationErrors();
    if (errors != null ? errors.length : void 0) {
      if (!application.testing) {
        console.debug("Validation failed for " + this.constructor.className + ": '" + (this.get('name') || this) + "'.");
        for (i = 0, len = errors.length; i < len; i++) {
          error = errors[i];
          console.debug("\t", error.dataPath, ':', error.message);
        }
        if (typeof console.trace === "function") {
          console.trace();
        }
      }
      return errors;
    }
  };

  CocoModel.prototype.save = function(attrs, options) {
    var error, originalOptions, ref, ref1, success;
    if (options == null) {
      options = {};
    }
    originalOptions = _.cloneDeep(options);
    if (options.headers == null) {
      options.headers = {};
    }
    options.headers['X-Current-Path'] = (ref = (ref1 = document.location) != null ? ref1.pathname : void 0) != null ? ref : 'unknown';
    success = options.success;
    error = options.error;
    options.success = (function(_this) {
      return function(model, res) {
        _this.retries = 0;
        _this.trigger('save:success', _this);
        if (success) {
          success(_this, res);
        }
        if (_this._revertAttributes) {
          _this.markToRevert();
        }
        _this.clearBackup();
        CocoModel.pollAchievements();
        return options.success = options.error = null;
      };
    })(this);
    options.error = (function(_this) {
      return function(model, res) {
        var error1, error2, errorMessage, f, msg, notyError, ref2;
        if (res.status === 0) {
          if (_this.retries == null) {
            _this.retries = 0;
          }
          _this.retries += 1;
          if (_this.retries > 20) {
            msg = 'Your computer or our servers appear to be offline. Please try refreshing.';
            noty({
              text: msg,
              layout: 'center',
              type: 'error',
              killer: true
            });
            return;
          } else {
            msg = $.i18n.t('loading_error.connection_failure', {
              defaultValue: 'Connection failed.'
            });
            try {
              noty({
                text: msg,
                layout: 'center',
                type: 'error',
                killer: true,
                timeout: 3000
              });
            } catch (error1) {
              notyError = error1;
              console.warn("Couldn't even show noty error for", error, "because", notyError);
            }
            return _.delay((f = function() {
              return _this.save(attrs, originalOptions);
            }), 3000);
          }
        }
        if (error) {
          error(_this, res);
        }
        if (!_this.notyErrors) {
          return;
        }
        errorMessage = "Error saving " + ((ref2 = _this.get('name')) != null ? ref2 : _this.type());
        console.log('going to log an error message');
        console.warn(errorMessage, res.responseJSON);
        if (!(typeof webkit !== "undefined" && webkit !== null ? webkit.messageHandlers : void 0)) {
          try {
            noty({
              text: errorMessage + ": " + res.status + " " + res.statusText + "\n" + res.responseText,
              layout: 'topCenter',
              type: 'error',
              killer: false,
              timeout: 10000
            });
          } catch (error2) {
            notyError = error2;
            console.warn("Couldn't even show noty error for", error, "because", notyError);
          }
        }
        return options.success = options.error = null;
      };
    })(this);
    this.trigger('save', this);
    return CocoModel.__super__.save.call(this, attrs, options);
  };

  CocoModel.prototype.patch = function(options) {
    var attrs, i, key, keys, len, ref;
    if (!this._revertAttributes) {
      return false;
    }
    if (options == null) {
      options = {};
    }
    options.patch = true;
    options.type = 'PUT';
    attrs = {
      _id: this.id
    };
    keys = [];
    ref = _.keys(this.attributes);
    for (i = 0, len = ref.length; i < len; i++) {
      key = ref[i];
      if (!_.isEqual(this.attributes[key], this._revertAttributes[key])) {
        attrs[key] = this.attributes[key];
        keys.push(key);
      }
    }
    if (!keys.length) {
      return;
    }
    return this.save(attrs, options);
  };

  CocoModel.prototype.fetch = function(options) {
    if (options == null) {
      options = {};
    }
    if (options.data == null) {
      options.data = {};
    }
    if (this.project) {
      options.data.project = this.project.join(',');
    }
    this.jqxhr = CocoModel.__super__.fetch.call(this, options);
    this.loading = true;
    return this.jqxhr;
  };

  CocoModel.prototype.markToRevert = function() {
    var ref, results, smallProp, value;
    if (this.type() === 'ThangType') {
      this._revertAttributes = _.clone(this.attributes);
      ref = this.attributes;
      results = [];
      for (smallProp in ref) {
        value = ref[smallProp];
        if (value && smallProp !== 'raw') {
          results.push(this._revertAttributes[smallProp] = _.cloneDeep(value));
        }
      }
      return results;
    } else {
      return this._revertAttributes = $.extend(true, {}, this.attributes);
    }
  };

  CocoModel.prototype.revert = function() {
    this.clear({
      silent: true
    });
    if (this._revertAttributes) {
      this.set(this._revertAttributes, {
        silent: true
      });
    }
    return this.clearBackup();
  };

  CocoModel.prototype.clearBackup = function() {
    return storage.remove(this.backupKey());
  };

  CocoModel.prototype.hasLocalChanges = function() {
    return this._revertAttributes && !_.isEqual(this.attributes, this._revertAttributes);
  };

  CocoModel.prototype.cloneNewMinorVersion = function() {
    var clone, newData;
    newData = _.clone(this.attributes);
    clone = new this.constructor(newData);
    return clone;
  };

  CocoModel.prototype.cloneNewMajorVersion = function() {
    var clone;
    clone = this.cloneNewMinorVersion();
    clone.unset('version');
    return clone;
  };

  CocoModel.prototype.isPublished = function() {
    var i, len, permission, ref, ref1;
    ref1 = (ref = this.get('permissions', true)) != null ? ref : [];
    for (i = 0, len = ref1.length; i < len; i++) {
      permission = ref1[i];
      if (permission.target === 'public' && permission.access === 'read') {
        return true;
      }
    }
    return false;
  };

  CocoModel.prototype.publish = function() {
    if (this.isPublished()) {
      throw new Error('Can\'t publish what\'s already-published. Can\'t kill what\'s already dead.');
    }
    return this.set('permissions', this.get('permissions', true).concat({
      access: 'read',
      target: 'public'
    }));
  };

  CocoModel.isObjectID = function(s) {
    var ref;
    return s.length === 24 && ((ref = s.match(/[a-f0-9]/gi)) != null ? ref.length : void 0) === 24;
  };

  CocoModel.prototype.hasReadAccess = function(actor) {
    var i, len, permission, ref, ref1, ref2;
    if (actor == null) {
      actor = me;
    }
    if (actor.isAdmin()) {
      return true;
    }
    if (actor.isArtisan() && this.editableByArtisans) {
      return true;
    }
    ref1 = (ref = this.get('permissions', true)) != null ? ref : [];
    for (i = 0, len = ref1.length; i < len; i++) {
      permission = ref1[i];
      if (permission.target === 'public' || actor.get('_id') === permission.target) {
        if ((ref2 = permission.access) === 'owner' || ref2 === 'read') {
          return true;
        }
      }
    }
    return false;
  };

  CocoModel.prototype.hasWriteAccess = function(actor) {
    var i, len, permission, ref, ref1, ref2;
    if (actor == null) {
      actor = me;
    }
    if (actor.isAdmin()) {
      return true;
    }
    if (actor.isArtisan() && this.editableByArtisans) {
      return true;
    }
    ref1 = (ref = this.get('permissions', true)) != null ? ref : [];
    for (i = 0, len = ref1.length; i < len; i++) {
      permission = ref1[i];
      if (permission.target === 'public' || actor.get('_id') === permission.target) {
        if ((ref2 = permission.access) === 'owner' || ref2 === 'write') {
          return true;
        }
      }
    }
    return false;
  };

  CocoModel.prototype.getOwner = function() {
    var ownerPermission;
    ownerPermission = _.find(this.get('permissions', true), {
      access: 'owner'
    });
    return ownerPermission != null ? ownerPermission.target : void 0;
  };

  CocoModel.prototype.getDelta = function() {
    var differ;
    differ = deltasLib.makeJSONDiffer();
    return differ.diff(_.omit(this._revertAttributes, deltasLib.DOC_SKIP_PATHS), _.omit(this.attributes, deltasLib.DOC_SKIP_PATHS));
  };

  CocoModel.prototype.getDeltaWith = function(otherModel) {
    var differ;
    differ = deltasLib.makeJSONDiffer();
    return differ.diff(this.attributes, otherModel.attributes);
  };

  CocoModel.prototype.applyDelta = function(delta) {
    var error, error1, key, newAttributes, value;
    newAttributes = $.extend(true, {}, this.attributes);
    try {
      jsondiffpatch.patch(newAttributes, delta);
    } catch (error1) {
      error = error1;
      console.error('Error applying delta\n', JSON.stringify(delta, null, '\t'), '\n\nto attributes\n\n', newAttributes);
      return false;
    }
    for (key in newAttributes) {
      value = newAttributes[key];
      if (_.isEqual(value, this.attributes[key])) {
        delete newAttributes[key];
      }
    }
    this.set(newAttributes);
    return true;
  };

  CocoModel.prototype.getExpandedDelta = function() {
    var delta;
    delta = this.getDelta();
    return deltasLib.expandDelta(delta, this._revertAttributes, this.schema());
  };

  CocoModel.prototype.getExpandedDeltaWith = function(otherModel) {
    var delta;
    delta = this.getDeltaWith(otherModel);
    return deltasLib.expandDelta(delta, this.attributes, this.schema());
  };

  CocoModel.prototype.watch = function(doWatch) {
    if (doWatch == null) {
      doWatch = true;
    }
    $.ajax(this.urlRoot + "/" + this.id + "/watch", {
      type: 'PUT',
      data: {
        on: doWatch
      }
    });
    return this.watching = function() {
      return doWatch;
    };
  };

  CocoModel.prototype.watching = function() {
    var ref;
    return ref = me.id, indexOf.call(this.get('watchers') || [], ref) >= 0;
  };

  CocoModel.prototype.populateI18N = function(data, schema, path) {
    var addedI18N, childSchema, i, index, key, len, numChanged, ref, ref1, sum, value;
    if (path == null) {
      path = '';
    }
    sum = 0;
    if (data == null) {
      data = $.extend(true, {}, this.attributes);
    }
    if (schema == null) {
      schema = this.schema() || {};
    }
    if (schema.oneOf) {
      schema = _.find(schema.oneOf, {
        type: 'object'
      });
    }
    addedI18N = false;
    if (((ref = schema.properties) != null ? ref.i18n : void 0) && _.isPlainObject(data) && (data.i18n == null)) {
      data.i18n = {
        '-': {
          '-': '-'
        }
      };
      sum += 1;
      addedI18N = true;
    }
    if (_.isPlainObject(data)) {
      for (key in data) {
        value = data[key];
        numChanged = 0;
        childSchema = (ref1 = schema.properties) != null ? ref1[key] : void 0;
        if (!childSchema && _.isObject(schema.additionalProperties)) {
          childSchema = schema.additionalProperties;
        }
        if (childSchema) {
          numChanged = this.populateI18N(value, childSchema, path + '/' + key);
        }
        if (numChanged && !path) {
          this.set(key, value);
        }
        sum += numChanged;
      }
    }
    if (schema.items && _.isArray(data)) {
      for (index = i = 0, len = data.length; i < len; index = ++i) {
        value = data[index];
        sum += this.populateI18N(value, schema.items, path + '/' + index);
      }
    }
    if (addedI18N && !path) {
      this.set('i18n', data.i18n);
    }
    this.updateI18NCoverage();
    return sum;
  };

  CocoModel.getReferencedModel = function(data, schema) {
    var link, linkObject, ref;
    if (schema.links == null) {
      return null;
    }
    linkObject = _.find(schema.links, {
      rel: 'db'
    });
    if (!linkObject) {
      return null;
    }
    if (linkObject.href.match('thang.type') && !this.isObjectID(data)) {
      return null;
    }
    link = linkObject.href;
    link = link.replace('{(original)}', data.original);
    link = link.replace('{(majorVersion)}', '' + ((ref = data.majorVersion) != null ? ref : 0));
    link = link.replace('{($)}', data);
    return this.getOrMakeModelFromLink(link);
  };

  CocoModel.getOrMakeModelFromLink = function(link) {
    var Model, e, error1, makeUrlFunc, model, modelModule, modelUrl, modulePath;
    makeUrlFunc = function(url) {
      return function() {
        return url;
      };
    };
    modelUrl = link.split('/')[2];
    modelModule = _.string.classify(modelUrl);
    modulePath = "models/" + modelModule;
    try {
      Model = require(modulePath);
    } catch (error1) {
      e = error1;
      console.error('could not load model from link path', link, 'using path', modulePath);
      return;
    }
    model = new Model();
    model.url = makeUrlFunc(link);
    return model;
  };

  CocoModel.prototype.setURL = function(url) {
    var makeURLFunc;
    makeURLFunc = function(u) {
      return function() {
        return u;
      };
    };
    this.url = makeURLFunc(url);
    return this;
  };

  CocoModel.prototype.getURL = function() {
    if (_.isString(this.url)) {
      return this.url;
    } else {
      return this.url();
    }
  };

  CocoModel.pollAchievements = function() {
    var CocoCollection, EarnedAchievement, NewAchievementCollection, achievements;
    if (application.testing) {
      return;
    }
    CocoCollection = require('collections/CocoCollection');
    EarnedAchievement = require('models/EarnedAchievement');
    NewAchievementCollection = (function(superClass1) {
      extend(NewAchievementCollection, superClass1);

      function NewAchievementCollection() {
        return NewAchievementCollection.__super__.constructor.apply(this, arguments);
      }

      NewAchievementCollection.prototype.model = EarnedAchievement;

      NewAchievementCollection.prototype.initialize = function(me) {
        if (me == null) {
          me = require('core/auth').me;
        }
        return this.url = "/db/user/" + me.id + "/achievements?notified=false";
      };

      return NewAchievementCollection;

    })(CocoCollection);
    achievements = new NewAchievementCollection;
    return achievements.fetch({
      success: function(collection) {
        if (!_.isEmpty(collection.models)) {
          return me.fetch({
            cache: false,
            success: function() {
              return Backbone.Mediator.publish('achievements:new', {
                earnedAchievements: collection
              });
            }
          });
        }
      },
      error: function() {
        return console.error('Miserably failed to fetch unnotified achievements', arguments);
      },
      cache: false
    });
  };

  CocoModel.pollAchievements = _.debounce(CocoModel.pollAchievements, 500);

  CocoModel.prototype.updateI18NCoverage = function() {
    var langCodeArrays, overallCoverage, pathToData;
    langCodeArrays = [];
    pathToData = {};
    TreemaUtils.walk(this.attributes, this.schema(), null, function(path, data, workingSchema) {
      var coverage, i18n, parentData, parentPath, prop, props;
      if (data != null ? data.i18n : void 0) {
        pathToData[path] = data;
      }
      if (_.string.endsWith(path, 'i18n')) {
        i18n = data;
        parentPath = path.slice(0, -5);
        parentData = pathToData[parentPath];
        props = workingSchema.props || [];
        props = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = props.length; i < len; i++) {
            prop = props[i];
            if (parentData[prop]) {
              results.push(prop);
            }
          }
          return results;
        })();
        if (!props.length) {
          return;
        }
        if ('additionalProperties' in i18n) {
          return;
        }
        coverage = _.filter(_.keys(i18n), function(langCode) {
          var translations;
          translations = i18n[langCode];
          return translations && _.all((function() {
            var i, len, results;
            results = [];
            for (i = 0, len = props.length; i < len; i++) {
              prop = props[i];
              results.push(translations[prop]);
            }
            return results;
          })());
        });
        return langCodeArrays.push(coverage);
      }
    });
    if (!langCodeArrays.length) {
      return;
    }
    overallCoverage = _.intersection.apply(_, langCodeArrays);
    return this.set('i18nCoverage', overallCoverage);
  };

  CocoModel.prototype.saveNewMinorVersion = function(attrs, options) {
    if (options == null) {
      options = {};
    }
    options.url = this.url() + '/new-version';
    options.type = 'POST';
    return this.save(attrs, options);
  };

  CocoModel.prototype.saveNewMajorVersion = function(attrs, options) {
    if (options == null) {
      options = {};
    }
    attrs = attrs || _.omit(this.attributes, 'version');
    options.url = this.url() + '/new-version';
    options.type = 'POST';
    options.patch = true;
    return this.save(attrs, options);
  };

  CocoModel.prototype.fetchPatchesWithStatus = function(status, options) {
    var Patches, patches;
    if (status == null) {
      status = 'pending';
    }
    if (options == null) {
      options = {};
    }
    Patches = require('../collections/Patches');
    patches = new Patches();
    if (options.data == null) {
      options.data = {};
    }
    options.data.status = status;
    options.url = this.urlRoot + '/' + (this.get('original') || this.id) + '/patches';
    patches.fetch(options);
    return patches;
  };

  CocoModel.prototype.stringify = function() {
    return JSON.stringify(this.toJSON());
  };

  CocoModel.prototype.wait = function(event) {
    return new Promise((function(_this) {
      return function(resolve) {
        return _this.once(event, resolve);
      };
    })(this));
  };

  return CocoModel;

})(Backbone.Model);

module.exports = CocoModel;
});

;require.register("models/CodeLog", function(exports, require, module) {
var CocoModel, CodeLog,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

module.exports = CodeLog = (function(superClass) {
  extend(CodeLog, superClass);

  function CodeLog() {
    return CodeLog.__super__.constructor.apply(this, arguments);
  }

  CodeLog.className = 'CodeLog';

  CodeLog.schema = require('schemas/models/codelog.schema');

  CodeLog.prototype.urlRoot = '/db/codelogs';

  return CodeLog;

})(CocoModel);
});

;require.register("models/Course", function(exports, require, module) {
var CocoModel, Course, schema, utils,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

schema = require('schemas/models/course.schema');

utils = require('core/utils');

module.exports = Course = (function(superClass) {
  extend(Course, superClass);

  function Course() {
    return Course.__super__.constructor.apply(this, arguments);
  }

  Course.className = 'Course';

  Course.schema = schema;

  Course.prototype.urlRoot = '/db/course';

  Course.prototype.fetchForCourseInstance = function(courseInstanceID, opts) {
    var options;
    options = {
      url: "/db/course_instance/" + courseInstanceID + "/course"
    };
    _.extend(options, opts);
    return this.fetch(options);
  };

  Course.prototype.getTranslatedName = function() {
    return utils.i18n(this.attributes, 'name');
  };

  return Course;

})(CocoModel);
});

;require.register("models/CourseInstance", function(exports, require, module) {
var CocoModel, CourseInstance, schema,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

CocoModel = require('./CocoModel');

schema = require('schemas/models/course_instance.schema');

module.exports = CourseInstance = (function(superClass) {
  extend(CourseInstance, superClass);

  function CourseInstance() {
    return CourseInstance.__super__.constructor.apply(this, arguments);
  }

  CourseInstance.className = 'CourseInstance';

  CourseInstance.schema = schema;

  CourseInstance.prototype.urlRoot = '/db/course_instance';

  CourseInstance.prototype.addMember = function(userID, opts) {
    var jqxhr, options;
    options = {
      method: 'POST',
      url: _.result(this, 'url') + '/members',
      data: {
        userID: userID
      }
    };
    _.extend(options, opts);
    jqxhr = this.fetch(options);
    if (userID === me.id) {
      if (!me.get('courseInstances')) {
        me.set('courseInstances', []);
      }
      me.get('courseInstances').push(this.id);
    }
    return jqxhr;
  };

  CourseInstance.prototype.addMembers = function(userIDs, opts) {
    var jqxhr, options, ref;
    options = {
      method: 'POST',
      url: _.result(this, 'url') + '/members',
      data: {
        userIDs: userIDs
      },
      success: (function(_this) {
        return function() {
          return _this.trigger('add-members', {
            userIDs: userIDs
          });
        };
      })(this)
    };
    _.extend(options, opts);
    jqxhr = this.fetch(options);
    if (ref = me.id, indexOf.call(userIDs, ref) >= 0) {
      if (!me.get('courseInstances')) {
        me.set('courseInstances', []);
      }
      me.get('courseInstances').push(this.id);
    }
    return jqxhr;
  };

  CourseInstance.prototype.removeMember = function(userID, opts) {
    var jqxhr, options;
    options = {
      url: _.result(this, 'url') + '/members',
      type: 'DELETE',
      data: {
        userID: userID
      }
    };
    _.extend(options, opts);
    jqxhr = this.fetch(options);
    if (userID === me.id) {
      me.set('courseInstances', _.without(me.get('courseInstances'), this.id));
    }
    return jqxhr;
  };

  CourseInstance.prototype.firstLevelURL = function() {
    return "/play/level/dungeons-of-kithgard?course=" + (this.get('courseID')) + "&course-instance=" + this.id;
  };

  CourseInstance.prototype.hasMember = function(userID, opts) {
    userID = userID.id || userID;
    return indexOf.call(this.get('members'), userID) >= 0;
  };

  return CourseInstance;

})(CocoModel);
});

;require.register("models/EarnedAchievement", function(exports, require, module) {
var CocoModel, EarnedAchievement, utils,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

utils = require('../core/utils');

module.exports = EarnedAchievement = (function(superClass) {
  extend(EarnedAchievement, superClass);

  function EarnedAchievement() {
    return EarnedAchievement.__super__.constructor.apply(this, arguments);
  }

  EarnedAchievement.className = 'EarnedAchievement';

  EarnedAchievement.schema = require('schemas/models/earned_achievement');

  EarnedAchievement.prototype.urlRoot = '/db/earned_achievement';

  EarnedAchievement.prototype.save = function() {
    if (this.get('earnedRewards') === null) {
      this.unset('earnedRewards');
    }
    return EarnedAchievement.__super__.save.apply(this, arguments);
  };

  return EarnedAchievement;

})(CocoModel);
});

;require.register("models/File", function(exports, require, module) {
var CocoModel, File,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

module.exports = File = (function(superClass) {
  extend(File, superClass);

  function File() {
    return File.__super__.constructor.apply(this, arguments);
  }

  File.className = 'File';

  File.schema = {};

  File.prototype.urlRoot = '/db/file';

  return File;

})(CocoModel);
});

;require.register("models/GameUIState", function(exports, require, module) {
var CocoModel, GameUIState,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

module.exports = GameUIState = (function(superClass) {
  extend(GameUIState, superClass);

  function GameUIState() {
    return GameUIState.__super__.constructor.apply(this, arguments);
  }

  GameUIState.className = 'GameUIState';

  GameUIState.schema = {
    type: 'object',
    properties: {
      canDragCamera: {
        type: 'boolean',
        description: 'Serves as a lock to enable or disable camera movement.'
      },
      selected: {
        type: 'object',
        description: 'Array of selected thangs',
        properties: {
          sprite: {
            description: 'Lank instance'
          },
          thang: {
            description: 'Thang object generated by the world'
          }
        }
      }
    }
  };

  GameUIState.prototype.defaults = function() {
    return {
      selected: [],
      canDragCamera: true,
      realTimeInputEvents: new Backbone.Collection()
    };
  };

  return GameUIState;

})(CocoModel);
});

;require.register("models/Level", function(exports, require, module) {
var CocoModel, Level, LevelComponent, LevelSystem, ThangType,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  slice = [].slice;

CocoModel = require('./CocoModel');

LevelComponent = require('./LevelComponent');

LevelSystem = require('./LevelSystem');

ThangType = require('./ThangType');

module.exports = Level = (function(superClass) {
  extend(Level, superClass);

  function Level() {
    return Level.__super__.constructor.apply(this, arguments);
  }

  Level.className = 'Level';

  Level.schema = require('schemas/models/level');

  Level.levels = {
    'dungeons-of-kithgard': '5411cb3769152f1707be029c',
    'defense-of-plainswood': '541b67f71ccc8eaae19f3c62'
  };

  Level.prototype.urlRoot = '/db/level';

  Level.prototype.editableByArtisans = true;

  Level.prototype.serialize = function(options) {
    var cached, i, j, lc, len, len1, ls, o, otherSession, ref, ref1, ref2, ref3, ref4, ref5, ref6, session, sessionHeroes, supermodel, systemModels, t, tmap, tt;
    supermodel = options.supermodel, session = options.session, otherSession = options.otherSession, this.headless = options.headless, this.sessionless = options.sessionless, cached = (ref = options.cached) != null ? ref : false;
    o = this.denormalize(supermodel, session, otherSession);
    o.levelComponents = cached ? this.getCachedLevelComponents(supermodel) : $.extend(true, [], (function() {
      var i, len, ref1, results;
      ref1 = supermodel.getModels(LevelComponent);
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        lc = ref1[i];
        results.push(lc.attributes);
      }
      return results;
    })());
    this.sortThangComponents(o.thangs, o.levelComponents, 'Level Thang');
    this.fillInDefaultComponentConfiguration(o.thangs, o.levelComponents);
    systemModels = $.extend(true, [], (function() {
      var i, len, ref1, results;
      ref1 = supermodel.getModels(LevelSystem);
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        ls = ref1[i];
        results.push(ls.attributes);
      }
      return results;
    })());
    o.systems = this.sortSystems(o.systems, systemModels);
    this.fillInDefaultSystemConfiguration(o.systems);
    tmap = {};
    ref2 = (ref1 = o.thangs) != null ? ref1 : [];
    for (i = 0, len = ref2.length; i < len; i++) {
      t = ref2[i];
      tmap[t.thangType] = true;
    }
    sessionHeroes = [session != null ? (ref3 = session.get('heroConfig')) != null ? ref3.thangType : void 0 : void 0, otherSession != null ? (ref4 = otherSession.get('heroConfig')) != null ? ref4.thangType : void 0 : void 0];
    o.thangTypes = [];
    ref5 = supermodel.getModels(ThangType);
    for (j = 0, len1 = ref5.length; j < len1; j++) {
      tt = ref5[j];
      if (tmap[tt.get('original')] || (tt.get('kind') !== 'Hero' && (tt.get('kind') != null) && tt.get('components') && !tt.notInLevel) || (tt.get('kind') === 'Hero' && (this.isType('course', 'course-ladder', 'game-dev') || (ref6 = tt.get('original'), indexOf.call(sessionHeroes, ref6) >= 0)))) {
        o.thangTypes.push({
          original: tt.get('original'),
          name: tt.get('name'),
          components: $.extend(true, [], tt.get('components'))
        });
      }
    }
    this.sortThangComponents(o.thangTypes, o.levelComponents, 'ThangType');
    this.fillInDefaultComponentConfiguration(o.thangTypes, o.levelComponents);
    if (this.picoCTFProblem) {
      o.picoCTFProblem = this.picoCTFProblem;
    }
    return o;
  };

  Level.prototype.cachedLevelComponents = null;

  Level.prototype.getCachedLevelComponents = function(supermodel) {
    var base, i, len, levelComponent, levelComponents, name, newLevelComponents;
    if (this.cachedLevelComponents == null) {
      this.cachedLevelComponents = {};
    }
    levelComponents = supermodel.getModels(LevelComponent);
    newLevelComponents = [];
    for (i = 0, len = levelComponents.length; i < len; i++) {
      levelComponent = levelComponents[i];
      if (levelComponent.hasLocalChanges()) {
        newLevelComponents.push($.extend(true, {}, levelComponent.attributes));
        continue;
      }
      if ((base = this.cachedLevelComponents)[name = levelComponent.id] == null) {
        base[name] = this.cachedLevelComponents[levelComponent.id] = $.extend(true, {}, levelComponent.attributes);
      }
      newLevelComponents.push(this.cachedLevelComponents[levelComponent.id]);
    }
    return newLevelComponents;
  };

  Level.prototype.denormalize = function(supermodel, session, otherSession) {
    var i, len, levelThang, o, ref, thangTypesByOriginal, thangTypesWithComponents, tt;
    o = $.extend(true, {}, this.attributes);
    if (o.thangs && this.isType('hero', 'hero-ladder', 'hero-coop', 'course', 'course-ladder', 'game-dev', 'web-dev')) {
      thangTypesWithComponents = (function() {
        var i, len, ref, results;
        ref = supermodel.getModels(ThangType);
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          tt = ref[i];
          if (tt.get('components') != null) {
            results.push(tt);
          }
        }
        return results;
      })();
      thangTypesByOriginal = _.indexBy(thangTypesWithComponents, function(tt) {
        return tt.get('original');
      });
      ref = o.thangs;
      for (i = 0, len = ref.length; i < len; i++) {
        levelThang = ref[i];
        this.denormalizeThang(levelThang, supermodel, session, otherSession, thangTypesByOriginal);
      }
    }
    return o;
  };

  Level.prototype.denormalizeThang = function(levelThang, supermodel, session, otherSession, thangTypesByOriginal) {
    var config, configs, copy, defaultPlaceholderComponent, defaultThangComponent, equips, heroThangType, i, inventory, isHero, j, k, l, len, len1, len2, len3, levelThangComponent, original, placeholderComponent, placeholderConfig, placeholderThangType, placeholders, placeholdersUsed, programmableProperties, ref, ref1, ref10, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, thangComponent, thangType;
    if (levelThang.components == null) {
      levelThang.components = [];
    }
    isHero = /Hero Placeholder/.test(levelThang.id) && this.isType('hero', 'hero-ladder', 'hero-coop');
    if (isHero && otherSession) {
      if (levelThang.id === 'Hero Placeholder 1' && session.get('team') === 'humans') {
        session = otherSession;
      } else if (levelThang.id === 'Hero Placeholder' && session.get('team') === 'ogres') {
        session = otherSession;
      }
    }
    if (isHero) {
      placeholders = {};
      placeholdersUsed = {};
      placeholderThangType = thangTypesByOriginal[levelThang.thangType];
      if (!placeholderThangType) {
        console.error("Couldn't find placeholder ThangType for the hero!");
        isHero = false;
      } else {
        ref = placeholderThangType.get('components');
        for (i = 0, len = ref.length; i < len; i++) {
          defaultPlaceholderComponent = ref[i];
          placeholders[defaultPlaceholderComponent.original] = defaultPlaceholderComponent;
        }
        ref1 = levelThang.components;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          thangComponent = ref1[j];
          placeholders[thangComponent.original] = thangComponent;
        }
        levelThang.components = [];
        heroThangType = session != null ? (ref2 = session.get('heroConfig')) != null ? ref2.thangType : void 0 : void 0;
        if (heroThangType) {
          levelThang.thangType = heroThangType;
        }
      }
    }
    thangType = thangTypesByOriginal[levelThang.thangType];
    configs = {};
    ref3 = levelThang.components;
    for (k = 0, len2 = ref3.length; k < len2; k++) {
      thangComponent = ref3[k];
      configs[thangComponent.original] = thangComponent;
    }
    ref4 = (thangType != null ? thangType.get('components') : void 0) || [];
    for (l = 0, len3 = ref4.length; l < len3; l++) {
      defaultThangComponent = ref4[l];
      if (levelThangComponent = configs[defaultThangComponent.original]) {
        copy = $.extend(true, {}, defaultThangComponent.config);
        levelThangComponent.config = _.merge(copy, levelThangComponent.config);
      } else {
        levelThangComponent = $.extend(true, {}, defaultThangComponent);
        levelThang.components.push(levelThangComponent);
      }
      if (isHero && (placeholderComponent = placeholders[defaultThangComponent.original])) {
        placeholdersUsed[placeholderComponent.original] = true;
        placeholderConfig = (ref5 = placeholderComponent.config) != null ? ref5 : {};
        if (levelThangComponent.config == null) {
          levelThangComponent.config = {};
        }
        config = levelThangComponent.config;
        if (placeholderConfig.pos) {
          if (config.pos == null) {
            config.pos = {};
          }
          config.pos.x = placeholderConfig.pos.x;
          config.pos.y = placeholderConfig.pos.y;
          config.rotation = placeholderConfig.rotation;
        } else if (placeholderConfig.team) {
          config.team = placeholderConfig.team;
        } else if (placeholderConfig.significantProperty) {
          config.significantProperty = placeholderConfig.significantProperty;
        } else if (placeholderConfig.programmableMethods) {
          copy = $.extend(true, {}, placeholderConfig);
          programmableProperties = (ref6 = config != null ? config.programmableProperties : void 0) != null ? ref6 : [];
          copy.programmableProperties = _.union(programmableProperties, (ref7 = copy.programmableProperties) != null ? ref7 : []);
          levelThangComponent.config = config = _.merge(copy, config);
        } else if (placeholderConfig.extraHUDProperties) {
          config.extraHUDProperties = _.union((ref8 = config.extraHUDProperties) != null ? ref8 : [], placeholderConfig.extraHUDProperties);
        } else if (placeholderConfig.voiceRange) {
          config.voiceRange = placeholderConfig.voiceRange;
          config.cooldown = placeholderConfig.cooldown;
        }
      }
    }
    if (isHero) {
      if (equips = _.find(levelThang.components, {
        original: LevelComponent.EquipsID
      })) {
        inventory = session != null ? (ref9 = session.get('heroConfig')) != null ? ref9.inventory : void 0 : void 0;
        if (equips.config == null) {
          equips.config = {};
        }
        if (inventory) {
          equips.config.inventory = $.extend(true, {}, inventory);
        }
      }
      for (original in placeholders) {
        placeholderComponent = placeholders[original];
        if (!placeholdersUsed[original]) {
          levelThang.components.push(placeholderComponent);
        }
      }
    }
    if (/Hero Placeholder/.test(levelThang.id) && this.isType('course') && !this.headless && !this.sessionless) {
      heroThangType = ((ref10 = me.get('heroConfig')) != null ? ref10.thangType : void 0) || ThangType.heroes.captain;
      if (heroThangType) {
        return levelThang.thangType = heroThangType;
      }
    }
  };

  Level.prototype.sortSystems = function(levelSystems, systemModels) {
    var i, len, originalsSeen, ref, ref1, sorted, system, visit;
    ref = [[], {}], sorted = ref[0], originalsSeen = ref[1];
    visit = function(system) {
      var d, i, len, ref1, system2, systemModel;
      if (system.original in originalsSeen) {
        return;
      }
      systemModel = _.find(systemModels, {
        original: system.original
      });
      if (!systemModel) {
        return console.error('Couldn\'t find model for original', system.original, 'from', systemModels);
      }
      ref1 = systemModel.dependencies || [];
      for (i = 0, len = ref1.length; i < len; i++) {
        d = ref1[i];
        system2 = _.find(levelSystems, {
          original: d.original
        });
        visit(system2);
      }
      sorted.push({
        model: systemModel,
        config: $.extend(true, {}, system.config)
      });
      return originalsSeen[system.original] = true;
    };
    ref1 = levelSystems != null ? levelSystems : [];
    for (i = 0, len = ref1.length; i < len; i++) {
      system = ref1[i];
      visit(system);
    }
    return sorted;
  };

  Level.prototype.sortThangComponents = function(thangs, levelComponents, parentType) {
    var actsComponent, alliedComponent, comp, i, j, len, len1, originalsToComponents, originalsToThangComponents, ref, ref1, results, sorted, thang, visit;
    originalsToComponents = _.indexBy(levelComponents, 'original');
    alliedComponent = _.find(levelComponents, {
      name: 'Allied'
    });
    actsComponent = _.find(levelComponents, {
      name: 'Acts'
    });
    ref = thangs != null ? thangs : [];
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      thang = ref[i];
      originalsToThangComponents = _.indexBy(thang.components, 'original');
      sorted = [];
      visit = function(c, namesToIgnore) {
        var acts, allied, c2, d, dependent, j, k, l, lc, len1, len2, len3, ref1, ref2, ref3, ref4;
        if (indexOf.call(sorted, c) >= 0) {
          return;
        }
        lc = originalsToComponents[c.original];
        if (!lc) {
          console.error(thang.id || thang.name, 'couldn\'t find lc for', c, 'of', levelComponents);
        }
        if (!lc) {
          return;
        }
        if (namesToIgnore && (ref1 = lc.name, indexOf.call(namesToIgnore, ref1) >= 0)) {
          return;
        }
        if (lc.name === 'Plans') {
          ref2 = thang.components;
          for (j = 0, len1 = ref2.length; j < len1; j++) {
            c2 = ref2[j];
            visit(c2, [lc.name, 'Programmable']);
          }
        } else if (lc.name === 'Programmable') {
          ref3 = thang.components;
          for (k = 0, len2 = ref3.length; k < len2; k++) {
            c2 = ref3[k];
            visit(c2, [lc.name]);
          }
        } else {
          ref4 = lc.dependencies || [];
          for (l = 0, len3 = ref4.length; l < len3; l++) {
            d = ref4[l];
            c2 = originalsToThangComponents[d.original];
            if (!c2) {
              dependent = originalsToComponents[d.original];
              dependent = (dependent != null ? dependent.name : void 0) || d.original;
              console.error(parentType, thang.id || thang.name, 'does not have dependent Component', dependent, 'from', lc.name);
            }
            if (c2) {
              visit(c2);
            }
          }
          if (lc.name === 'Collides' && alliedComponent) {
            if (allied = originalsToThangComponents[alliedComponent.original]) {
              visit(allied);
            }
          }
          if (lc.name === 'Moves' && actsComponent) {
            if (acts = originalsToThangComponents[actsComponent.original]) {
              visit(acts);
            }
          }
        }
        return sorted.push(c);
      };
      ref1 = thang.components;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        comp = ref1[j];
        visit(comp);
      }
      results.push(thang.components = sorted);
    }
    return results;
  };

  Level.prototype.fillInDefaultComponentConfiguration = function(thangs, levelComponents) {
    var cached, cachedConfigs, component, defaultConfiguration, i, isPhysical, lc, len, missed, originalComponent, ref, results, thang;
    if (this.defaultComponentConfigurations == null) {
      this.defaultComponentConfigurations = {};
    }
    cached = 0;
    missed = 0;
    cachedConfigs = 0;
    ref = thangs != null ? thangs : [];
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      thang = ref[i];
      results.push((function() {
        var base, j, len1, name, ref1, ref2, results1;
        ref1 = thang.components || [];
        results1 = [];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          component = ref1[j];
          isPhysical = component.original === LevelComponent.PhysicalID;
          if (!isPhysical && (defaultConfiguration = _.find(this.defaultComponentConfigurations[component.original], (function(d) {
            return _.isEqual(component, d.originalComponent);
          })))) {
            component.config = defaultConfiguration.defaultedConfig;
            ++cached;
            continue;
          }
          if (!(lc = _.find(levelComponents, {
            original: component.original
          }))) {
            continue;
          }
          if (!isPhysical) {
            originalComponent = $.extend(true, {}, component);
          }
          if (component.config == null) {
            component.config = {};
          }
          TreemaUtils.populateDefaults(component.config, (ref2 = lc.configSchema) != null ? ref2 : {}, tv4);
          this.lastType = 'component';
          this.lastOriginal = component.original;
          if (!isPhysical) {
            if ((base = this.defaultComponentConfigurations)[name = component.original] == null) {
              base[name] = [];
            }
            this.defaultComponentConfigurations[component.original].push({
              originalComponent: originalComponent,
              defaultedConfig: component.config
            });
            ++cachedConfigs;
          }
          results1.push(++missed);
        }
        return results1;
      }).call(this));
    }
    return results;
  };

  Level.prototype.fillInDefaultSystemConfiguration = function(levelSystems) {
    var i, len, ref, results, system;
    ref = levelSystems != null ? levelSystems : [];
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      system = ref[i];
      if (system.config == null) {
        system.config = {};
      }
      TreemaUtils.populateDefaults(system.config, system.model.configSchema, tv4);
      this.lastType = 'system';
      results.push(this.lastOriginal = system.model.name);
    }
    return results;
  };

  Level.prototype.dimensions = function() {
    var c, component, height, i, j, len, len1, ref, ref1, thang, width;
    width = 0;
    height = 0;
    ref = this.get('thangs') || [];
    for (i = 0, len = ref.length; i < len; i++) {
      thang = ref[i];
      ref1 = thang.components;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        component = ref1[j];
        c = component.config;
        if (c == null) {
          continue;
        }
        if ((c.width != null) && c.width > width) {
          width = c.width;
        }
        if ((c.height != null) && c.height > height) {
          height = c.height;
        }
      }
    }
    return {
      width: width,
      height: height
    };
  };

  Level.prototype.isLadder = function() {
    var ref;
    return ((ref = this.get('type')) != null ? ref.indexOf('ladder') : void 0) > -1;
  };

  Level.prototype.isProject = function() {
    return this.get('shareable') === 'project';
  };

  Level.prototype.isType = function() {
    var ref, types;
    types = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return ref = this.get('type', true), indexOf.call(types, ref) >= 0;
  };

  Level.prototype.fetchNextForCourse = function(arg, options) {
    var courseID, courseInstanceID, levelOriginalID, sessionID;
    levelOriginalID = arg.levelOriginalID, courseInstanceID = arg.courseInstanceID, courseID = arg.courseID, sessionID = arg.sessionID;
    if (options == null) {
      options = {};
    }
    if (courseInstanceID) {
      options.url = "/db/course_instance/" + courseInstanceID + "/levels/" + levelOriginalID + "/sessions/" + sessionID + "/next";
    } else {
      options.url = "/db/course/" + courseID + "/levels/" + levelOriginalID + "/next";
    }
    return this.fetch(options);
  };

  Level.prototype.getSolutions = function() {
    var config, e, error, hero, i, len, ref, ref1, ref2, ref3, ref4, solution, solutions;
    if (!(hero = _.find((ref = this.get("thangs")) != null ? ref : [], {
      id: 'Hero Placeholder'
    }))) {
      return [];
    }
    if (!(config = (ref1 = _.find((ref2 = hero.components) != null ? ref2 : [], function(x) {
      var ref3, ref4;
      return (ref3 = x.config) != null ? (ref4 = ref3.programmableMethods) != null ? ref4.plan : void 0 : void 0;
    })) != null ? ref1.config : void 0)) {
      return [];
    }
    solutions = _.cloneDeep((ref3 = config.programmableMethods.plan.solutions) != null ? ref3 : []);
    for (i = 0, len = solutions.length; i < len; i++) {
      solution = solutions[i];
      try {
        solution.source = _.template(solution.source)(config != null ? (ref4 = config.programmableMethods) != null ? ref4.plan.context : void 0 : void 0);
      } catch (error) {
        e = error;
        console.error("Problem with template and solution comments for", this.get('slug'), e);
      }
    }
    return solutions;
  };

  return Level;

})(CocoModel);
});

;require.register("models/LevelComponent", function(exports, require, module) {
var CocoModel, LevelComponent,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

CocoModel = require('./CocoModel');

module.exports = LevelComponent = (function(superClass) {
  extend(LevelComponent, superClass);

  function LevelComponent() {
    return LevelComponent.__super__.constructor.apply(this, arguments);
  }

  LevelComponent.className = 'LevelComponent';

  LevelComponent.schema = require('schemas/models/level_component');

  LevelComponent.EquipsID = '53e217d253457600003e3ebb';

  LevelComponent.ItemID = '53e12043b82921000051cdf9';

  LevelComponent.AttacksID = '524b7ba57fc0f6d519000016';

  LevelComponent.PhysicalID = '524b75ad7fc0f6d519000001';

  LevelComponent.ExistsID = '524b4150ff92f1f4f8000024';

  LevelComponent.LandID = '524b7aff7fc0f6d519000006';

  LevelComponent.CollidesID = '524b7b857fc0f6d519000012';

  LevelComponent.PlansID = '524b7b517fc0f6d51900000d';

  LevelComponent.ProgrammableID = '524b7b5a7fc0f6d51900000e';

  LevelComponent.MovesID = '524b7b8c7fc0f6d519000013';

  LevelComponent.MissileID = '524cc2593ea855e0ab000142';

  LevelComponent.FindsPathsID = '52872b0ead92b98561000002';

  LevelComponent.prototype.urlRoot = '/db/level.component';

  LevelComponent.prototype.editableByArtisans = true;

  LevelComponent.prototype.set = function(key, val, options) {
    var attrs, ref;
    if (_.isObject(key)) {
      ref = [key, val], attrs = ref[0], options = ref[1];
    } else {
      (attrs = {})[key] = val;
    }
    if ('code' in attrs && !('js' in attrs)) {
      attrs.js = this.compile(attrs.code);
    }
    return LevelComponent.__super__.set.call(this, attrs, options);
  };

  LevelComponent.prototype.onLoaded = function() {
    LevelComponent.__super__.onLoaded.call(this);
    if (!this.get('js')) {
      return this.set('js', this.compile(this.get('code')));
    }
  };

  LevelComponent.prototype.compile = function(code) {
    var e, error, js;
    if (this.get('codeLanguage') && this.get('codeLanguage') !== 'coffeescript') {
      return console.error('Can\'t compile', this.get('codeLanguage'), '-- only CoffeeScript.', this);
    }
    try {
      js = CoffeeScript.compile(code, {
        bare: true
      });
    } catch (error) {
      e = error;
      js = this.get('js');
    }
    return js;
  };

  LevelComponent.prototype.getDependencies = function(allComponents) {
    var comp, dep, i, j, len, len1, ref, ref1, result, results;
    results = [];
    ref = this.get('dependencies') || [];
    for (i = 0, len = ref.length; i < len; i++) {
      dep = ref[i];
      comp = _.find(allComponents, function(c) {
        return c.get('original') === dep.original && c.get('version').major === dep.majorVersion;
      });
      ref1 = comp.getDependencies(allComponents).concat([comp]);
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        result = ref1[j];
        if (indexOf.call(results, result) < 0) {
          results.push(result);
        }
      }
    }
    return results;
  };

  return LevelComponent;

})(CocoModel);
});

;require.register("models/LevelFeedback", function(exports, require, module) {
var CocoModel, LevelFeedback,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

module.exports = LevelFeedback = (function(superClass) {
  extend(LevelFeedback, superClass);

  function LevelFeedback() {
    return LevelFeedback.__super__.constructor.apply(this, arguments);
  }

  LevelFeedback.className = 'LevelFeedback';

  LevelFeedback.schema = require('schemas/models/level_feedback');

  LevelFeedback.prototype.urlRoot = '/db/level.feedback';

  return LevelFeedback;

})(CocoModel);
});

;require.register("models/LevelSession", function(exports, require, module) {
var CocoModel, LevelSession,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

module.exports = LevelSession = (function(superClass) {
  extend(LevelSession, superClass);

  function LevelSession() {
    return LevelSession.__super__.constructor.apply(this, arguments);
  }

  LevelSession.className = 'LevelSession';

  LevelSession.schema = require('schemas/models/level_session');

  LevelSession.prototype.urlRoot = '/db/level.session';

  LevelSession.prototype.initialize = function() {
    LevelSession.__super__.initialize.call(this);
    return this.on('sync', (function(_this) {
      return function(e) {
        var state;
        state = _this.get('state') || {};
        if (state.scripts == null) {
          state.scripts = {};
        }
        return _this.set('state', state);
      };
    })(this));
  };

  LevelSession.prototype.updatePermissions = function() {
    var p, permissions;
    permissions = this.get('permissions', true);
    permissions = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = permissions.length; i < len; i++) {
        p = permissions[i];
        if (p.target !== 'public') {
          results.push(p);
        }
      }
      return results;
    })();
    return this.set('permissions', permissions);
  };

  LevelSession.prototype.getSourceFor = function(spellKey) {
    var code, parts, ref;
    code = this.get('code');
    parts = spellKey.split('/');
    return code != null ? (ref = code[parts[0]]) != null ? ref[parts[1]] : void 0 : void 0;
  };

  LevelSession.prototype.readyToRank = function() {
    var c1, c2, i, item, len, ref, s, spell, team, thang, thangSpellArr;
    if (!this.get('levelID')) {
      return false;
    }
    if (!(c1 = this.get('code'))) {
      return false;
    }
    if (!(team = this.get('team'))) {
      return false;
    }
    if (!(c2 = this.get('submittedCode'))) {
      return true;
    }
    thangSpellArr = (function() {
      var i, len, ref, results;
      ref = this.get('teamSpells')[team];
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        s = ref[i];
        results.push(s.split('/'));
      }
      return results;
    }).call(this);
    for (i = 0, len = thangSpellArr.length; i < len; i++) {
      item = thangSpellArr[i];
      thang = item[0];
      spell = item[1];
      if (c1[thang][spell] !== ((ref = c2[thang]) != null ? ref[spell] : void 0)) {
        return true;
      }
    }
    return false;
  };

  LevelSession.prototype.isMultiplayer = function() {
    return (this.get('submittedCodeLanguage') != null) && (this.get('team') != null);
  };

  LevelSession.prototype.completed = function() {
    var ref;
    return ((ref = this.get('state')) != null ? ref.complete : void 0) || this.get('submitted') || false;
  };

  LevelSession.prototype.shouldAvoidCorruptData = function(attrs) {
    var ref, ref1, ref2, ref3;
    if (me.team !== 'humans') {
      return false;
    }
    if (_.string.startsWith((ref = (ref1 = (ref2 = attrs != null ? attrs.code : void 0) != null ? ref2 : this.get('code')) != null ? (ref3 = ref1.anya) != null ? ref3.makeBid : void 0 : void 0) != null ? ref : '', 'var __interceptThis')) {
      noty({
        text: "Not saving session--it's trying to overwrite Anya's code with transpiled output. Please let us know and help us reproduce this bug!",
        layout: 'topCenter',
        type: 'error',
        killer: false,
        timeout: 120000
      });
      return true;
    }
    return false;
  };

  LevelSession.prototype.save = function(attrs, options) {
    if (this.shouldAvoidCorruptData(attrs)) {
      return;
    }
    return LevelSession.__super__.save.call(this, attrs, options);
  };

  LevelSession.prototype.increaseDifficulty = function(callback) {
    var ref, ref1, state;
    state = (ref = this.get('state')) != null ? ref : {};
    state.difficulty = ((ref1 = state.difficulty) != null ? ref1 : 0) + 1;
    delete state.lastUnsuccessfulSubmissionTime;
    this.set('state', state);
    this.trigger('change-difficulty');
    return this.save(null, {
      success: callback
    });
  };

  LevelSession.prototype.timeUntilResubmit = function() {
    var last, ref, state, wait;
    state = (ref = this.get('state')) != null ? ref : {};
    if (!(last = state.lastUnsuccessfulSubmissionTime)) {
      return 0;
    }
    if (_.isString(last)) {
      last = new Date(last);
    }
    wait = (last - new Date()) + 22 * 60 * 60 * 1000;
    if (wait > 24 * 60 * 60 * 1000) {
      wait = 24 * 60 * 60 * 1000;
      state.lastUnsuccessfulSubmissionTime = new Date();
      this.set('state', state);
    }
    return wait;
  };

  LevelSession.prototype.recordScores = function(scores, level) {
    var i, len, newScore, newTopScores, now, oldTopScore, oldTopScores, ref, ref1, ref2, scoreType, state;
    if (!scores) {
      return;
    }
    state = this.get('state');
    oldTopScores = (ref = state.topScores) != null ? ref : [];
    newTopScores = [];
    now = new Date();
    ref2 = (ref1 = level.get('scoreTypes')) != null ? ref1 : [];
    for (i = 0, len = ref2.length; i < len; i++) {
      scoreType = ref2[i];
      oldTopScore = _.find(oldTopScores, {
        type: scoreType
      });
      newScore = scores[scoreType];
      if (newScore == null) {
        newTopScores.push(oldTopScore);
        continue;
      }
      if (scoreType === 'time' || scoreType === 'damage-taken') {
        newScore *= -1;
      }
      if ((oldTopScore == null) || newScore > oldTopScore.score) {
        newTopScores.push({
          type: scoreType,
          date: now,
          score: newScore
        });
      } else {
        newTopScores.push(oldTopScore);
      }
    }
    state.topScores = newTopScores;
    return this.set('state', state);
  };

  LevelSession.prototype.generateSpellsObject = function(options) {
    var aetherOptions, createAetherOptions, e, error, level, ref, ref1, ref2, ref3, source, spellThang, spells;
    if (options == null) {
      options = {};
    }
    level = options.level;
    createAetherOptions = require('lib/aether_utils').createAetherOptions;
    aetherOptions = createAetherOptions({
      functionName: 'plan',
      codeLanguage: this.get('codeLanguage'),
      skipProtectAPI: (ref = options.level) != null ? ref.isType('game-dev') : void 0
    });
    spellThang = {
      thang: {
        id: 'Hero Placeholder'
      },
      aether: new Aether(aetherOptions)
    };
    spells = {
      "hero-placeholder/plan": {
        thang: spellThang,
        name: 'plan'
      }
    };
    source = (ref1 = (ref2 = this.get('code')) != null ? (ref3 = ref2['hero-placeholder']) != null ? ref3.plan : void 0 : void 0) != null ? ref1 : '';
    try {
      spellThang.aether.transpile(source);
    } catch (error) {
      e = error;
      console.log("Couldn't transpile!\n" + source + "\n", e);
      spellThang.aether.transpile('');
    }
    return spells;
  };

  LevelSession.prototype.isFake = function() {
    return this.id === 'A Fake Session ID';
  };

  return LevelSession;

})(CocoModel);
});

;require.register("models/LevelSystem", function(exports, require, module) {
var CocoModel, LevelSystem, SystemNameLoader,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

CocoModel = require('./CocoModel');

SystemNameLoader = require('core/SystemNameLoader');

module.exports = LevelSystem = (function(superClass) {
  extend(LevelSystem, superClass);

  function LevelSystem() {
    return LevelSystem.__super__.constructor.apply(this, arguments);
  }

  LevelSystem.className = 'LevelSystem';

  LevelSystem.schema = require('schemas/models/level_system');

  LevelSystem.prototype.urlRoot = '/db/level.system';

  LevelSystem.prototype.editableByArtisans = true;

  LevelSystem.prototype.set = function(key, val, options) {
    var attrs, ref;
    if (_.isObject(key)) {
      ref = [key, val], attrs = ref[0], options = ref[1];
    } else {
      (attrs = {})[key] = val;
    }
    if ('code' in attrs && !('js' in attrs)) {
      attrs.js = this.compile(attrs.code);
    }
    return LevelSystem.__super__.set.call(this, attrs, options);
  };

  LevelSystem.prototype.onLoaded = function() {
    LevelSystem.__super__.onLoaded.call(this);
    if (!this.get('js')) {
      this.set('js', this.compile(this.get('code')));
    }
    return SystemNameLoader.setName(this);
  };

  LevelSystem.prototype.compile = function(code) {
    var e, error, js;
    if (this.get('codeLanguage') && this.get('codeLanguage') !== 'coffeescript') {
      return console.error('Can\'t compile', this.get('codeLanguage'), '-- only CoffeeScript.', this);
    }
    try {
      js = CoffeeScript.compile(code, {
        bare: true
      });
    } catch (error) {
      e = error;
      js = this.get('js');
    }
    return js;
  };

  LevelSystem.prototype.getDependencies = function(allSystems) {
    var dep, i, j, len, len1, ref, ref1, result, results, system;
    results = [];
    ref = this.get('dependencies') || [];
    for (i = 0, len = ref.length; i < len; i++) {
      dep = ref[i];
      system = _.find(allSystems, function(sys) {
        return sys.get('original') === dep.original && sys.get('version').major === dep.majorVersion;
      });
      ref1 = system.getDependencies(allSystems).concat([system]);
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        result = ref1[j];
        if (indexOf.call(results, result) < 0) {
          results.push(result);
        }
      }
    }
    return results;
  };

  return LevelSystem;

})(CocoModel);
});

;require.register("models/Mandate", function(exports, require, module) {
var CocoModel, MandateModel,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

module.exports = MandateModel = (function(superClass) {
  extend(MandateModel, superClass);

  function MandateModel() {
    return MandateModel.__super__.constructor.apply(this, arguments);
  }

  MandateModel.className = 'Mandate';

  MandateModel.schema = require('schemas/models/mandate.schema');

  MandateModel.prototype.urlRoot = '/db/mandates';

  return MandateModel;

})(CocoModel);
});

;require.register("models/Patch", function(exports, require, module) {
var CocoModel, PatchModel,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

module.exports = PatchModel = (function(superClass) {
  extend(PatchModel, superClass);

  function PatchModel() {
    return PatchModel.__super__.constructor.apply(this, arguments);
  }

  PatchModel.className = 'Patch';

  PatchModel.schema = require('schemas/models/patch');

  PatchModel.prototype.urlRoot = '/db/patch';

  PatchModel.prototype.setStatus = function(status, options) {
    if (options == null) {
      options = {};
    }
    options.url = "/db/patch/" + this.id + "/status";
    options.type = 'PUT';
    return this.save({
      status: status
    }, options);
  };

  PatchModel.setStatus = function(id, status) {
    return $.ajax("/db/patch/" + id + "/status", {
      type: 'PUT',
      data: {
        status: status
      }
    });
  };

  return PatchModel;

})(CocoModel);
});

;require.register("models/Payment", function(exports, require, module) {
var CocoModel, Payment,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

module.exports = Payment = (function(superClass) {
  extend(Payment, superClass);

  function Payment() {
    return Payment.__super__.constructor.apply(this, arguments);
  }

  Payment.className = "Payment";

  Payment.prototype.urlRoot = "/db/payment";

  return Payment;

})(CocoModel);
});

;require.register("models/Poll", function(exports, require, module) {
var CocoModel, Poll, schema,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

schema = require('schemas/models/poll.schema');

module.exports = Poll = (function(superClass) {
  extend(Poll, superClass);

  function Poll() {
    return Poll.__super__.constructor.apply(this, arguments);
  }

  Poll.className = 'Poll';

  Poll.schema = schema;

  Poll.prototype.urlRoot = '/db/poll';

  Poll.prototype.applyDelta = function(delta) {
    var answerChanges, answerIndex, answerIndexNum, base, base1, change, i, i18nDelta, isDeletion, isI18N, key, language, len, oldTranslations, oldValue, pickedChange, ref, ref1, ref2, ref3, translationKey, translationValue, value;
    i18nDelta = {};
    if (delta.i18n) {
      i18nDelta.i18n = $.extend(true, {}, delta.i18n);
    }
    ref1 = (ref = delta.answers) != null ? ref : {};
    for (answerIndex in ref1) {
      answerChanges = ref1[answerIndex];
      if (i18nDelta.answers == null) {
        i18nDelta.answers = {};
      }
      if (_.isArray(answerChanges)) {
        if ((base = i18nDelta.answers)[answerIndex] == null) {
          base[answerIndex] = [];
        }
        for (i = 0, len = answerChanges.length; i < len; i++) {
          change = answerChanges[i];
          if (_.isNumber(change)) {
            pickedChange = change;
          } else {
            pickedChange = $.extend(true, {}, change);
            for (key in pickedChange) {
              answerIndexNum = parseInt(answerIndex.replace('_', ''), 10);
              if (!_.isNaN(answerIndexNum)) {
                oldValue = this.get('answers')[answerIndexNum][key];
                isDeletion = _.string.startsWith(answerIndex, '_');
                isI18N = key === 'i18n';
                if (isI18N && !isDeletion) {
                  value = pickedChange[key];
                  ref2 = oldValue != null ? oldValue : {};
                  for (language in ref2) {
                    oldTranslations = ref2[language];
                    ref3 = oldTranslations != null ? oldTranslations : {};
                    for (translationKey in ref3) {
                      translationValue = ref3[translationKey];
                      if (value[language] == null) {
                        value[language] = {};
                      }
                      if ((base1 = value[language])[translationKey] == null) {
                        base1[translationKey] = translationValue;
                      }
                    }
                  }
                } else {
                  value = oldValue;
                }
                pickedChange[key] = value;
              }
            }
          }
          i18nDelta.answers[answerIndex].push(pickedChange);
        }
      } else {
        i18nDelta.answers[answerIndex] = answerChanges;
        if (answerChanges != null ? answerChanges.votes : void 0) {
          i18nDelta.answers[answerIndex] = _.omit(answerChanges, 'votes');
        }
      }
    }
    return Poll.__super__.applyDelta.call(this, i18nDelta);
  };

  return Poll;

})(CocoModel);
});

;require.register("models/Prepaid", function(exports, require, module) {
var CocoModel, Prepaid, schema,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

schema = require('schemas/models/prepaid.schema');

module.exports = Prepaid = (function(superClass) {
  extend(Prepaid, superClass);

  function Prepaid() {
    return Prepaid.__super__.constructor.apply(this, arguments);
  }

  Prepaid.className = "Prepaid";

  Prepaid.prototype.urlRoot = '/db/prepaid';

  Prepaid.prototype.openSpots = function() {
    var ref;
    if (this.get('redeemers') != null) {
      return this.get('maxRedeemers') - ((ref = this.get('redeemers')) != null ? ref.length : void 0);
    }
    return this.get('maxRedeemers');
  };

  Prepaid.prototype.userHasRedeemed = function(userID) {
    var i, len, redeemer, ref;
    ref = this.get('redeemers');
    for (i = 0, len = ref.length; i < len; i++) {
      redeemer = ref[i];
      if (redeemer.userID === userID) {
        return redeemer.date;
      }
    }
    return null;
  };

  Prepaid.prototype.initialize = function() {
    this.listenTo(this, 'add', function() {
      var maxRedeemers;
      maxRedeemers = this.get('maxRedeemers');
      if (_.isString(maxRedeemers)) {
        return this.set('maxRedeemers', parseInt(maxRedeemers));
      }
    });
    return Prepaid.__super__.initialize.apply(this, arguments);
  };

  Prepaid.prototype.status = function() {
    var endDate, startDate;
    endDate = this.get('endDate');
    if (endDate && new Date(endDate) < new Date()) {
      return 'expired';
    }
    startDate = this.get('startDate');
    if (startDate && new Date(startDate) > new Date()) {
      return 'pending';
    }
    if (this.openSpots() <= 0) {
      return 'empty';
    }
    return 'available';
  };

  Prepaid.prototype.redeem = function(user, options) {
    if (options == null) {
      options = {};
    }
    options.url = _.result(this, 'url') + '/redeemers';
    options.type = 'POST';
    if (options.data == null) {
      options.data = {};
    }
    options.data.userID = user.id || user;
    return this.fetch(options);
  };

  return Prepaid;

})(CocoModel);
});

;require.register("models/Product", function(exports, require, module) {
var CocoModel, ProductModel,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

module.exports = ProductModel = (function(superClass) {
  extend(ProductModel, superClass);

  function ProductModel() {
    return ProductModel.__super__.constructor.apply(this, arguments);
  }

  ProductModel.className = 'Product';

  ProductModel.schema = require('schemas/models/product.schema');

  ProductModel.prototype.urlRoot = '/db/products';

  return ProductModel;

})(CocoModel);
});

;require.register("models/Purchase", function(exports, require, module) {
var CocoModel, Purchase,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

module.exports = Purchase = (function(superClass) {
  extend(Purchase, superClass);

  function Purchase() {
    return Purchase.__super__.constructor.apply(this, arguments);
  }

  Purchase.className = "Purchase";

  Purchase.prototype.urlRoot = "/db/purchase";

  Purchase.schema = require('schemas/models/purchase.schema');

  Purchase.makeFor = function(toPurchase) {
    var purchase;
    return purchase = new Purchase({
      recipient: me.id,
      purchaser: me.id,
      purchased: {
        original: toPurchase.get('original'),
        collection: _.string.underscored(toPurchase.constructor.className)
      }
    });
  };

  return Purchase;

})(CocoModel);
});

;require.register("models/State", function(exports, require, module) {
var CocoModel, State, schema,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

schema = require('schemas/models/poll.schema');

module.exports = State = (function(superClass) {
  extend(State, superClass);

  function State() {
    return State.__super__.constructor.apply(this, arguments);
  }

  State.className = 'State';

  return State;

})(CocoModel);
});

;require.register("models/StripeCoupon", function(exports, require, module) {
var CocoModel, StripeCoupon,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

module.exports = StripeCoupon = (function(superClass) {
  extend(StripeCoupon, superClass);

  function StripeCoupon() {
    return StripeCoupon.__super__.constructor.apply(this, arguments);
  }

  StripeCoupon.className = 'StripeCoupon';

  StripeCoupon.schema = {};

  StripeCoupon.prototype.urlRoot = '/stripe/coupons';

  StripeCoupon.prototype.idAttribute = 'id';

  StripeCoupon.prototype.formatString = function() {
    var bits;
    bits = [this.id];
    if (this.get('percent_off')) {
      bits.push("(" + (this.get('percent_off')) + "% off)");
    } else if (this.get('amount_off')) {
      bits.push("($" + (this.get('amount_off')) + " off)");
    }
    if (this.get('duration')) {
      bits.push("(duration: " + (this.get('duration')) + ")");
    }
    if (this.redeem_by) {
      bits.push("(redeem by: " + (moment(this.get('redeem_by')).format('lll')));
    }
    return bits.join(' ');
  };

  return StripeCoupon;

})(CocoModel);
});

;require.register("models/SuperModel", function(exports, require, module) {
var ModelResource, RequestResource, Resource, SomethingResource, SuperModel,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

module.exports = SuperModel = (function(superClass) {
  extend(SuperModel, superClass);

  function SuperModel() {
    this.updateProgress = bind(this.updateProgress, this);
    this.num = 0;
    this.denom = 0;
    this.progress = 0;
    this.resources = {};
    this.rid = 0;
    this.maxProgress = 1;
    this.models = {};
    this.collections = {};
  }

  SuperModel.prototype.report = function() {
    var j, len, ref, resource, unfinished;
    console.info('SuperModel report ------------------------');
    console.info((_.values(this.resources).length) + " resources.");
    unfinished = [];
    ref = _.values(this.resources);
    for (j = 0, len = ref.length; j < len; j++) {
      resource = ref[j];
      if (!(resource)) {
        continue;
      }
      console.info("\t", resource.name, 'loaded', resource.isLoaded, resource.model);
      if (!resource.isLoaded) {
        unfinished.push(resource);
      }
    }
    return unfinished;
  };

  SuperModel.prototype.loadModel = function(model, name, fetchOptions, value) {
    var cachedModel, res;
    if (value == null) {
      value = 1;
    }
    if (_.isNumber(fetchOptions)) {
      value = fetchOptions;
    }
    if (_.isObject(name)) {
      fetchOptions = name;
    }
    if (!((fetchOptions != null ? fetchOptions.cache : void 0) === false && name === 'opponent_session')) {
      cachedModel = this.getModelByURL(model.getURL());
    }
    if (cachedModel) {
      if (cachedModel.loaded) {
        res = this.addModelResource(cachedModel, name, fetchOptions, 0);
        res.markLoaded();
        return res;
      } else {
        res = this.addModelResource(cachedModel, name, fetchOptions, value);
        res.markLoading();
        return res;
      }
    } else {
      this.registerModel(model);
      res = this.addModelResource(model, name, fetchOptions, value);
      if (model.loaded) {
        res.markLoaded();
      } else {
        res.load();
      }
      return res;
    }
  };

  SuperModel.prototype.loadCollection = function(collection, name, fetchOptions, value) {
    var cachedCollection, onCollectionSynced, res, url;
    if (value == null) {
      value = 1;
    }
    if (_.isNumber(fetchOptions)) {
      value = fetchOptions;
    }
    if (_.isObject(name)) {
      fetchOptions = name;
    }
    url = collection.getURL();
    if (cachedCollection = this.collections[url]) {
      console.debug('Collection cache hit', url, 'already loaded', cachedCollection.loaded);
      if (cachedCollection.loaded) {
        res = this.addModelResource(cachedCollection, name, fetchOptions, 0);
        res.markLoaded();
        return res;
      } else {
        res = this.addModelResource(cachedCollection, name, fetchOptions, value);
        res.markLoading();
        return res;
      }
    } else {
      this.addCollection(collection);
      onCollectionSynced = function(c) {
        if (collection.url === c.url) {
          return this.registerCollection(c);
        } else {
          console.warn('Sync triggered for collection', c);
          console.warn('Yet got other object', c);
          return this.listenToOnce(collection, 'sync', onCollectionSynced);
        }
      };
      this.listenToOnce(collection, 'sync', onCollectionSynced);
      res = this.addModelResource(collection, name, fetchOptions, value);
      if (!(res.isLoading || res.isLoaded)) {
        res.load();
      }
      return res;
    }
  };

  SuperModel.prototype.trackModel = function(model, value) {
    var res;
    res = this.addModelResource(model, '', {}, value);
    return res.listen();
  };

  SuperModel.prototype.trackCollection = function(collection, value) {
    var res;
    res = this.addModelResource(collection, '', {}, value);
    return res.listen();
  };

  SuperModel.prototype.trackRequest = function(jqxhr, value) {
    var res;
    if (value == null) {
      value = 1;
    }
    res = new Resource('', value);
    res.jqxhr = jqxhr;
    jqxhr.done(function() {
      return res.markLoaded();
    });
    jqxhr.fail(function() {
      return res.markFailed();
    });
    this.storeResource(res, value);
    return jqxhr;
  };

  SuperModel.prototype.trackRequests = function(jqxhrs, value) {
    var j, jqxhr, len, results;
    if (value == null) {
      value = 1;
    }
    results = [];
    for (j = 0, len = jqxhrs.length; j < len; j++) {
      jqxhr = jqxhrs[j];
      results.push(this.trackRequest(jqxhr, value));
    }
    return results;
  };

  SuperModel.prototype.shouldSaveBackups = function(model) {
    return false;
  };

  SuperModel.prototype.getModel = function(ModelClass_or_url, id) {
    var m;
    if (_.isString(ModelClass_or_url)) {
      return this.getModelByURL(ModelClass_or_url);
    }
    m = new ModelClass_or_url({
      _id: id
    });
    return this.getModelByURL(m.getURL());
  };

  SuperModel.prototype.getModelByURL = function(modelURL) {
    if (_.isFunction(modelURL)) {
      modelURL = modelURL();
    }
    return this.models[modelURL] || null;
  };

  SuperModel.prototype.getModelByOriginal = function(ModelClass, original, filter) {
    if (filter == null) {
      filter = null;
    }
    return _.find(this.models, function(m) {
      return m.get('original') === original && m.constructor.className === ModelClass.className && (!filter || filter(m));
    });
  };

  SuperModel.prototype.getModelByOriginalAndMajorVersion = function(ModelClass, original, majorVersion) {
    if (majorVersion == null) {
      majorVersion = 0;
    }
    return _.find(this.models, function(m) {
      var v;
      if (!(v = m.get('version'))) {
        return;
      }
      return m.get('original') === original && v.major === majorVersion && m.constructor.className === ModelClass.className;
    });
  };

  SuperModel.prototype.getModels = function(ModelClass) {
    var key, m;
    if (ModelClass) {
      return (function() {
        var ref, results;
        ref = this.models;
        results = [];
        for (key in ref) {
          m = ref[key];
          if (m.constructor.className === ModelClass.className) {
            results.push(m);
          }
        }
        return results;
      }).call(this);
    }
    return _.values(this.models);
  };

  SuperModel.prototype.registerModel = function(model) {
    return this.models[model.getURL()] = model;
  };

  SuperModel.prototype.getCollection = function(collection) {
    return this.collections[collection.getURL()] || collection;
  };

  SuperModel.prototype.addCollection = function(collection) {
    var url;
    url = collection.getURL();
    if ((this.collections[url] != null) && this.collections[url] !== collection) {
      return console.warn("Tried to add Collection '" + url + "' to SuperModel when we already had it.");
    }
    return this.registerCollection(collection);
  };

  SuperModel.prototype.registerCollection = function(collection) {
    var cachedModel, clone, i, j, len, model, ref;
    if (collection.isCachable) {
      this.collections[collection.getURL()] = collection;
    }
    ref = collection.models;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      model = ref[i];
      cachedModel = this.getModelByURL(model.getURL());
      if (cachedModel) {
        clone = $.extend(true, {}, model.attributes);
        cachedModel.set(clone, {
          silent: true,
          fromMerge: true
        });
      } else {
        this.registerModel(model);
      }
    }
    return collection;
  };

  SuperModel.prototype.finished = function() {
    return (this.progress === 1.0) || (!this.denom) || this.failed;
  };

  SuperModel.prototype.addModelResource = function(modelOrCollection, name, fetchOptions, value) {
    var res;
    if (value == null) {
      value = 1;
    }
    if (_.isNumber(fetchOptions)) {
      value = fetchOptions;
    }
    if (_.isObject(name)) {
      fetchOptions = name;
    }
    modelOrCollection.saveBackups = modelOrCollection.saveBackups || this.shouldSaveBackups(modelOrCollection);
    this.checkName(name);
    res = new ModelResource(modelOrCollection, name, fetchOptions, value);
    this.storeResource(res, value);
    return res;
  };

  SuperModel.prototype.removeModelResource = function(modelOrCollection) {
    return this.removeResource(_.find(this.resources, function(resource) {
      return (resource != null ? resource.model : void 0) === modelOrCollection;
    }));
  };

  SuperModel.prototype.addRequestResource = function(name, jqxhrOptions, value) {
    var res;
    if (value == null) {
      value = 1;
    }
    if (_.isNumber(jqxhrOptions)) {
      value = jqxhrOptions;
    }
    if (_.isObject(name)) {
      jqxhrOptions = name;
    }
    this.checkName(name);
    res = new RequestResource(name, jqxhrOptions, value);
    this.storeResource(res, value);
    return res;
  };

  SuperModel.prototype.addSomethingResource = function(name, value) {
    var res;
    if (value == null) {
      value = 1;
    }
    if (_.isNumber(name)) {
      value = name;
    }
    this.checkName(name);
    res = new SomethingResource(name, value);
    this.storeResource(res, value);
    return res;
  };

  SuperModel.prototype.checkName = function(name) {};

  SuperModel.prototype.storeResource = function(resource, value) {
    this.rid++;
    resource.rid = this.rid;
    this.resources[this.rid] = resource;
    this.listenToOnce(resource, 'loaded', this.onResourceLoaded);
    this.listenTo(resource, 'failed', this.onResourceFailed);
    this.denom += value;
    if (this.denom) {
      return _.defer(this.updateProgress);
    }
  };

  SuperModel.prototype.removeResource = function(resource) {
    if (!this.resources[resource.rid]) {
      return;
    }
    this.resources[resource.rid] = null;
    if (resource.isLoaded) {
      --this.num;
    }
    --this.denom;
    return _.defer(this.updateProgress);
  };

  SuperModel.prototype.onResourceLoaded = function(r) {
    if (!this.resources[r.rid]) {
      return;
    }
    this.num += r.value;
    _.defer(this.updateProgress);
    r.clean();
    this.stopListening(r, 'failed', this.onResourceFailed);
    return this.trigger('resource-loaded', r);
  };

  SuperModel.prototype.onResourceFailed = function(r) {
    if (!this.resources[r.rid]) {
      return;
    }
    this.failed = true;
    this.trigger('failed', {
      resource: r
    });
    return r.clean();
  };

  SuperModel.prototype.updateProgress = function() {
    var newProg;
    newProg = this.denom ? this.num / this.denom : 1;
    newProg = Math.min(this.maxProgress, newProg);
    if (this.progress >= newProg) {
      return;
    }
    this.progress = newProg;
    this.trigger('update-progress', this.progress);
    if (this.finished()) {
      return this.trigger('loaded-all');
    }
  };

  SuperModel.prototype.setMaxProgress = function(maxProgress) {
    this.maxProgress = maxProgress;
  };

  SuperModel.prototype.resetProgress = function() {
    return this.progress = 0;
  };

  SuperModel.prototype.clearMaxProgress = function() {
    this.maxProgress = 1;
    return _.defer(this.updateProgress);
  };

  SuperModel.prototype.getProgress = function() {
    return this.progress;
  };

  SuperModel.prototype.getResource = function(rid) {
    return this.resources[rid];
  };

  SuperModel.prototype.finishLoading = function() {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        if (_this.finished()) {
          return resolve(_this);
        }
        _this.once('failed', function(arg) {
          var jqxhr, ref, resource;
          resource = arg.resource;
          jqxhr = resource.jqxhr;
          return reject({
            message: ((ref = jqxhr.responseJSON) != null ? ref.message : void 0) || jqxhr.responseText || 'Unknown Error'
          });
        });
        return _this.once('loaded-all', function() {
          return resolve(_this);
        });
      };
    })(this));
  };

  return SuperModel;

})(Backbone.Model);

Resource = (function(superClass) {
  extend(Resource, superClass);

  function Resource(name, value) {
    if (value == null) {
      value = 1;
    }
    this.name = name;
    this.value = value;
    this.rid = -1;
    this.isLoading = false;
    this.isLoaded = false;
    this.model = null;
    this.jqxhr = null;
  }

  Resource.prototype.markLoaded = function() {
    if (this.isLoaded) {
      return;
    }
    this.trigger('loaded', this);
    this.isLoaded = true;
    return this.isLoading = false;
  };

  Resource.prototype.markFailed = function() {
    if (this.isLoaded) {
      return;
    }
    this.trigger('failed', this);
    this.isLoaded = this.isLoading = false;
    return this.isFailed = true;
  };

  Resource.prototype.markLoading = function() {
    this.isLoaded = this.isFailed = false;
    return this.isLoading = true;
  };

  Resource.prototype.clean = function() {
    return this.jqxhr = null;
  };

  Resource.prototype.load = function() {
    return this;
  };

  return Resource;

})(Backbone.Model);

ModelResource = (function(superClass) {
  extend(ModelResource, superClass);

  function ModelResource(modelOrCollection, name, fetchOptions, value) {
    ModelResource.__super__.constructor.call(this, name, value);
    this.model = modelOrCollection;
    this.fetchOptions = fetchOptions;
    this.jqxhr = this.model.jqxhr;
    this.loadsAttempted = 0;
  }

  ModelResource.prototype.load = function() {
    this.markLoading();
    this.fetchModel();
    return this;
  };

  ModelResource.prototype.fetchModel = function() {
    if (!this.model.loading) {
      this.jqxhr = this.model.fetch(this.fetchOptions);
    }
    return this.listen();
  };

  ModelResource.prototype.listen = function() {
    this.listenToOnce(this.model, 'sync', function() {
      return this.markLoaded();
    });
    return this.listenToOnce(this.model, 'error', function() {
      return this.markFailed();
    });
  };

  ModelResource.prototype.clean = function() {
    this.jqxhr = null;
    return this.model.jqxhr = null;
  };

  return ModelResource;

})(Resource);

RequestResource = (function(superClass) {
  extend(RequestResource, superClass);

  function RequestResource(name, jqxhrOptions, value) {
    RequestResource.__super__.constructor.call(this, name, value);
    this.jqxhrOptions = jqxhrOptions;
  }

  RequestResource.prototype.load = function() {
    this.markLoading();
    this.jqxhr = $.ajax(this.jqxhrOptions);
    this.jqxhr.done((function(_this) {
      return function() {
        return _.defer(function() {
          return _this.markLoaded();
        });
      };
    })(this));
    this.jqxhr.fail((function(_this) {
      return function() {
        return _.defer(function() {
          return _this.markFailed();
        });
      };
    })(this));
    return this;
  };

  return RequestResource;

})(Resource);

SomethingResource = (function(superClass) {
  extend(SomethingResource, superClass);

  function SomethingResource() {
    return SomethingResource.__super__.constructor.apply(this, arguments);
  }

  return SomethingResource;

})(Resource);
});

;require.register("models/ThangType", function(exports, require, module) {
var CocoCollection, CocoModel, LevelComponent, PrerenderedSpriteSheet, PrerenderedSpriteSheets, SpriteBuilder, ThangType, buildQueue, utils,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

SpriteBuilder = require('lib/sprites/SpriteBuilder');

LevelComponent = require('./LevelComponent');

CocoCollection = require('collections/CocoCollection');

utils = require('core/utils');

buildQueue = [];

module.exports = ThangType = (function(superClass) {
  extend(ThangType, superClass);

  function ThangType() {
    this.onFileUploaded = bind(this.onFileUploaded, this);
    return ThangType.__super__.constructor.apply(this, arguments);
  }

  ThangType.className = 'ThangType';

  ThangType.schema = require('schemas/models/thang_type');

  ThangType.heroes = {
    captain: '529ec584c423d4e83b000014',
    knight: '529ffbf1cf1818f2be000001',
    samurai: '53e12be0d042f23505c3023b',
    raider: '55527eb0b8abf4ba1fe9a107',
    goliath: '55e1a6e876cb0948c96af9f8',
    guardian: '566a058620de41290036a745',
    ninja: '52fc0ed77e01835453bd8f6c',
    'forest-archer': '5466d4f2417c8b48a9811e87',
    trapper: '5466d449417c8b48a9811e83',
    pixie: '',
    assassin: '566a2202e132c81f00f38c81',
    librarian: '52fbf74b7e01835453bd8d8e',
    'potion-master': '52e9adf7427172ae56002172',
    sorcerer: '52fd1524c7e6cf99160e7bc9',
    necromancer: '55652fb3b9effa46a1f775fd',
    'master-wizard': '',
    duelist: '57588f09046caf2e0012ed41',
    champion: '575848b522179b2800efbfbf'
  };

  ThangType.heroClasses = {
    Warrior: ['champion', 'duelist', 'captain', 'knight', 'samurai', 'raider', 'goliath', 'guardian'],
    Ranger: ['ninja', 'forest-archer', 'trapper', 'pixie', 'assassin'],
    Wizard: ['librarian', 'potion-master', 'sorcerer', 'necromancer', 'master-wizard']
  };

  ThangType.items = {
    'simple-boots': '53e237bf53457600003e3f05'
  };

  ThangType.prototype.urlRoot = '/db/thang.type';

  ThangType.prototype.building = {};

  ThangType.prototype.editableByArtisans = true;

  ThangType.defaultActions = ['idle', 'die', 'move', 'attack', 'trick', 'cast'];

  ThangType.prototype.initialize = function() {
    ThangType.__super__.initialize.call(this);
    this.building = {};
    return this.spriteSheets = {};
  };

  ThangType.prototype.resetRawData = function() {
    return this.set('raw', {
      shapes: {},
      containers: {},
      animations: {}
    });
  };

  ThangType.prototype.resetSpriteSheetCache = function() {
    this.buildActions();
    this.spriteSheets = {};
    return this.building = {};
  };

  ThangType.prototype.isFullyLoaded = function() {
    return this.get('actions') || this.get('raster');
  };

  ThangType.prototype.loadRasterImage = function() {
    var raster;
    if (this.loadingRaster || this.loadedRaster) {
      return;
    }
    if (!(raster = this.get('raster'))) {
      return;
    }
    this.rasterImage = $("<img src='/file/" + raster + "' />");
    this.loadingRaster = true;
    this.rasterImage.one('load', (function(_this) {
      return function() {
        _this.loadingRaster = false;
        _this.loadedRaster = true;
        return _this.trigger('raster-image-loaded', _this);
      };
    })(this));
    return this.rasterImage.one('error', (function(_this) {
      return function() {
        _this.loadingRaster = false;
        return _this.trigger('raster-image-load-errored', _this);
      };
    })(this));
  };

  ThangType.prototype.getActions = function() {
    if (!this.isFullyLoaded()) {
      return {};
    }
    return this.actions || this.buildActions();
  };

  ThangType.prototype.getDefaultActions = function() {
    var action, actions, i, len, ref;
    actions = [];
    ref = _.values(this.getActions());
    for (i = 0, len = ref.length; i < len; i++) {
      action = ref[i];
      if (!_.any(ThangType.defaultActions, function(prefix) {
        return _.string.startsWith(action.name, prefix);
      })) {
        continue;
      }
      actions.push(action);
    }
    return actions;
  };

  ThangType.prototype.buildActions = function() {
    var action, name, ref, ref1, ref2, relatedAction, relatedName;
    if (!this.isFullyLoaded()) {
      return null;
    }
    this.actions = $.extend(true, {}, this.get('actions'));
    ref = this.actions;
    for (name in ref) {
      action = ref[name];
      action.name = name;
      ref2 = (ref1 = action.relatedActions) != null ? ref1 : {};
      for (relatedName in ref2) {
        relatedAction = ref2[relatedName];
        relatedAction.name = action.name + '_' + relatedName;
        this.actions[relatedAction.name] = relatedAction;
      }
    }
    return this.actions;
  };

  ThangType.prototype.fillOptions = function(options) {
    if (options == null) {
      options = {};
    }
    options = _.clone(options);
    if (options.resolutionFactor == null) {
      options.resolutionFactor = SPRITE_RESOLUTION_FACTOR;
    }
    if (options.async == null) {
      options.async = false;
    }
    options.thang = null;
    return options;
  };

  ThangType.prototype.buildSpriteSheet = function(options) {
    var key, result, ss;
    if (!(this.isFullyLoaded() && this.get('raw'))) {
      return false;
    }
    this.options = this.fillOptions(options);
    key = this.spriteSheetKey(this.options);
    if (ss = this.spriteSheets[key]) {
      return ss;
    }
    if (this.building[key]) {
      this.options = null;
      return key;
    }
    this.t0 = new Date().getTime();
    this.initBuild(options);
    if (!this.options.portraitOnly) {
      this.addGeneralFrames();
    }
    this.addPortrait();
    this.building[key] = true;
    result = this.finishBuild();
    return result;
  };

  ThangType.prototype.initBuild = function(options) {
    if (!this.actions) {
      this.buildActions();
    }
    this.vectorParser = new SpriteBuilder(this, options);
    this.builder = new createjs.SpriteSheetBuilder();
    this.builder.padding = 2;
    return this.frames = {};
  };

  ThangType.prototype.addPortrait = function() {
    var frame, frames, mc, portrait, pt, rect, ref, s, scale;
    if (!this.actions) {
      return;
    }
    portrait = this.actions.portrait;
    if (!portrait) {
      return;
    }
    scale = portrait.scale || 1;
    pt = (ref = portrait.positions) != null ? ref.registration : void 0;
    rect = new createjs.Rectangle((pt != null ? pt.x : void 0) / scale || 0, (pt != null ? pt.y : void 0) / scale || 0, 100 / scale, 100 / scale);
    if (portrait.animation) {
      mc = this.vectorParser.buildMovieClip(portrait.animation);
      mc.nominalBounds = mc.frameBounds = null;
      this.builder.addMovieClip(mc, rect, scale);
      frames = this.builder._animations[portrait.animation].frames;
      if (portrait.frames != null) {
        frames = this.mapFrames(portrait.frames, frames[0]);
      }
      return this.builder.addAnimation('portrait', frames, true);
    } else if (portrait.container) {
      s = this.vectorParser.buildContainerFromStore(portrait.container);
      frame = this.builder.addFrame(s, rect, scale);
      return this.builder.addAnimation('portrait', [frame], false);
    }
  };

  ThangType.prototype.addGeneralFrames = function() {
    var action, animation, frame, frames, framesMap, i, len, mc, name, next, ref, ref1, ref2, ref3, ref4, results, s, scale;
    framesMap = {};
    ref = this.requiredRawAnimations();
    for (i = 0, len = ref.length; i < len; i++) {
      animation = ref[i];
      name = animation.animation;
      mc = this.vectorParser.buildMovieClip(name);
      if (!mc) {
        continue;
      }
      this.builder.addMovieClip(mc, null, animation.scale * this.options.resolutionFactor);
      framesMap[animation.scale + '_' + name] = this.builder._animations[name].frames;
    }
    ref1 = this.actions;
    for (name in ref1) {
      action = ref1[name];
      if (!action.animation) {
        continue;
      }
      if (name === 'portrait') {
        continue;
      }
      scale = (ref2 = (ref3 = action.scale) != null ? ref3 : this.get('scale')) != null ? ref2 : 1;
      frames = framesMap[scale + '_' + action.animation];
      if (!frames) {
        continue;
      }
      if (action.frames != null) {
        frames = this.mapFrames(action.frames, frames[0]);
      }
      next = true;
      if (action.goesTo) {
        next = action.goesTo;
      }
      if (action.loops === false) {
        next = false;
      }
      this.builder.addAnimation(name, frames, next);
    }
    ref4 = this.actions;
    results = [];
    for (name in ref4) {
      action = ref4[name];
      if (!(action.container && !action.animation)) {
        continue;
      }
      if (name === 'portrait') {
        continue;
      }
      scale = this.options.resolutionFactor * (action.scale || this.get('scale') || 1);
      s = this.vectorParser.buildContainerFromStore(action.container);
      if (!s) {
        continue;
      }
      frame = this.builder.addFrame(s, s.bounds, scale);
      results.push(this.builder.addAnimation(name, [frame], false));
    }
    return results;
  };

  ThangType.prototype.requiredRawAnimations = function() {
    var a, action, allActions, animation, i, len, name, ref, ref1, required, scale;
    required = [];
    ref = this.get('actions');
    for (name in ref) {
      action = ref[name];
      if (name === 'portrait') {
        continue;
      }
      allActions = [action].concat(_.values((ref1 = action.relatedActions) != null ? ref1 : {}));
      for (i = 0, len = allActions.length; i < len; i++) {
        a = allActions[i];
        if (!a.animation) {
          continue;
        }
        scale = name === 'portrait' ? a.scale || 1 : a.scale || this.get('scale') || 1;
        animation = {
          animation: a.animation,
          scale: scale
        };
        animation.portrait = name === 'portrait';
        if (!_.find(required, function(r) {
          return _.isEqual(r, animation);
        })) {
          required.push(animation);
        }
      }
    }
    return required;
  };

  ThangType.prototype.mapFrames = function(frames, frameOffset) {
    var f, i, len, ref, results;
    if (!_.isString(frames)) {
      return frames;
    }
    ref = frames.split(',');
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      f = ref[i];
      results.push(parseInt(f, 10) + frameOffset);
    }
    return results;
  };

  ThangType.prototype.finishBuild = function() {
    var key, spriteSheet;
    if (_.isEmpty(this.builder._animations)) {
      return;
    }
    key = this.spriteSheetKey(this.options);
    spriteSheet = null;
    if (this.options.async) {
      buildQueue.push(this.builder);
      this.builder.t0 = new Date().getTime();
      if (!(buildQueue.length > 1)) {
        this.builder.buildAsync();
      }
      this.builder.on('complete', this.onBuildSpriteSheetComplete, this, true, [this.builder, key, this.options]);
      this.builder = null;
      return key;
    }
    spriteSheet = this.builder.build();
    this.logBuild(this.t0, false, this.options.portraitOnly);
    this.spriteSheets[key] = spriteSheet;
    this.building[key] = false;
    this.builder = null;
    this.options = null;
    return spriteSheet;
  };

  ThangType.prototype.onBuildSpriteSheetComplete = function(e, data) {
    var builder, key, options, ref;
    builder = data[0], key = data[1], options = data[2];
    this.logBuild(builder.t0, true, options.portraitOnly);
    buildQueue = buildQueue.slice(1);
    if (buildQueue[0]) {
      buildQueue[0].t0 = new Date().getTime();
    }
    if ((ref = buildQueue[0]) != null) {
      ref.buildAsync();
    }
    this.spriteSheets[key] = e.target.spriteSheet;
    this.building[key] = false;
    this.trigger('build-complete', {
      key: key,
      thangType: this
    });
    return this.vectorParser = null;
  };

  ThangType.prototype.logBuild = function(startTime, async, portrait) {
    var kind, name, time;
    kind = async ? 'Async' : 'Sync ';
    portrait = portrait ? '(Portrait)' : '';
    name = _.string.rpad(this.get('name'), 20);
    time = _.string.lpad('' + new Date().getTime() - startTime, 6);
    return console.debug("Built sheet:  " + name + " " + time + "ms  " + kind + "  " + portrait);
  };

  ThangType.prototype.spriteSheetKey = function(options) {
    var colorConfigs, config, groupName, portraitOnly, ref;
    colorConfigs = [];
    ref = options.colorConfig || {};
    for (groupName in ref) {
      config = ref[groupName];
      colorConfigs.push(groupName + ":" + config.hue + "|" + config.saturation + "|" + config.lightness);
    }
    colorConfigs = colorConfigs.join(',');
    portraitOnly = !!options.portraitOnly;
    return (this.get('name')) + " - " + options.resolutionFactor + " - " + colorConfigs + " - " + portraitOnly;
  };

  ThangType.prototype.getHeroShortName = function() {
    var map;
    map = {
      "Assassin": "Ritic",
      "Captain": "Anya",
      "Champion": "Ida",
      "Master Wizard": "Usara",
      "Duelist": "Alejandro",
      "Forest Archer": "Naria",
      "Goliath": "Okar",
      "Guardian": "Illia",
      "Knight": "Tharin",
      "Librarian": "Hushbaum",
      "Necromancer": "Nalfar",
      "Ninja": "Amara",
      "Pixie": "Zana",
      "Potion Master": "Omarn",
      "Raider": "Arryn",
      "Samurai": "Hattori",
      "Ian Elliott": "Hattori",
      "Sorcerer": "Pender",
      "Trapper": "Senick"
    };
    return map[this.get('name')];
  };

  ThangType.prototype.getPortraitImage = function(spriteOptionsOrKey, size) {
    var src;
    if (size == null) {
      size = 100;
    }
    src = this.getPortraitSource(spriteOptionsOrKey, size);
    if (!src) {
      return null;
    }
    return $('<img />').attr('src', src);
  };

  ThangType.prototype.getPortraitSource = function(spriteOptionsOrKey, size) {
    var stage;
    if (size == null) {
      size = 100;
    }
    if (this.get('rasterIcon') || this.get('raster')) {
      return this.getPortraitURL();
    }
    stage = this.getPortraitStage(spriteOptionsOrKey, size);
    return stage != null ? stage.toDataURL() : void 0;
  };

  ThangType.prototype.getPortraitStage = function(spriteOptionsOrKey, size) {
    var canvas, err, error, key, options, pt, ref, ref1, ref2, ref3, sprite, spriteSheet, stage;
    if (size == null) {
      size = 100;
    }
    canvas = $("<canvas width='" + size + "' height='" + size + "'></canvas>");
    try {
      stage = new createjs.Stage(canvas[0]);
    } catch (error) {
      err = error;
      console.error("Error trying to create " + (this.get('name')) + " avatar stage:", err, "with window as", window);
      return null;
    }
    if (!this.isFullyLoaded()) {
      return stage;
    }
    key = spriteOptionsOrKey;
    key = _.isString(key) ? key : this.spriteSheetKey(this.fillOptions(key));
    spriteSheet = this.spriteSheets[key];
    if (!spriteSheet) {
      options = _.isPlainObject(spriteOptionsOrKey) ? spriteOptionsOrKey : {};
      options.portraitOnly = true;
      spriteSheet = this.buildSpriteSheet(options);
    }
    if (_.isString(spriteSheet)) {
      return;
    }
    if (!spriteSheet) {
      return;
    }
    sprite = new createjs.Sprite(spriteSheet);
    pt = (ref = this.actions.portrait) != null ? (ref1 = ref.positions) != null ? ref1.registration : void 0 : void 0;
    sprite.regX = (pt != null ? pt.x : void 0) || 0;
    sprite.regY = (pt != null ? pt.y : void 0) || 0;
    sprite.framerate = (ref2 = (ref3 = this.actions.portrait) != null ? ref3.framerate : void 0) != null ? ref2 : 20;
    sprite.gotoAndStop('portrait');
    stage.addChild(sprite);
    stage.update();
    stage.startTalking = function() {
      sprite.gotoAndPlay('portrait');
      return;
      if (this.tick) {
        return;
      }
      this.tick = (function(_this) {
        return function(e) {
          return _this.update(e);
        };
      })(this);
      return createjs.Ticker.addEventListener('tick', this.tick);
    };
    stage.stopTalking = function() {
      sprite.gotoAndStop('portrait');
      return;
      this.update();
      createjs.Ticker.removeEventListener('tick', this.tick);
      return this.tick = null;
    };
    return stage;
  };

  ThangType.prototype.getVectorPortraitStage = function(size) {
    var canvas, portrait, pt, ref, scale, sprite, stage, vectorParser;
    if (size == null) {
      size = 100;
    }
    if (!this.actions) {
      return;
    }
    canvas = $("<canvas width='" + size + "' height='" + size + "'></canvas>");
    stage = new createjs.Stage(canvas[0]);
    portrait = this.actions.portrait;
    if (!(portrait && (portrait.animation || portrait.container))) {
      return;
    }
    scale = portrait.scale || 1;
    vectorParser = new SpriteBuilder(this, {});
    if (portrait.animation) {
      sprite = vectorParser.buildMovieClip(portrait.animation);
      sprite.gotoAndStop(0);
    } else if (portrait.container) {
      sprite = vectorParser.buildContainerFromStore(portrait.container);
    }
    pt = (ref = portrait.positions) != null ? ref.registration : void 0;
    sprite.regX = (pt != null ? pt.x : void 0) / scale || 0;
    sprite.regY = (pt != null ? pt.y : void 0) / scale || 0;
    sprite.scaleX = sprite.scaleY = scale * size / 100;
    stage.addChild(sprite);
    stage.update();
    return stage;
  };

  ThangType.prototype.uploadGenericPortrait = function(callback, src) {
    var body;
    if (src == null) {
      src = this.getPortraitSource();
    }
    if (!(src && _.string.startsWith(src, 'data:'))) {
      return typeof callback === "function" ? callback() : void 0;
    }
    src = src.replace('data:image/png;base64,', '').replace(/\ /g, '+');
    body = {
      filename: 'portrait.png',
      mimetype: 'image/png',
      path: "db/thang.type/" + (this.get('original')),
      b64png: src,
      force: 'true'
    };
    return $.ajax('/file', {
      type: 'POST',
      data: body,
      success: callback || this.onFileUploaded
    });
  };

  ThangType.prototype.onFileUploaded = function() {
    return console.log('Image uploaded');
  };

  ThangType.loadUniversalWizard = function() {
    var url, wizOriginal;
    if (this.wizardType) {
      return this.wizardType;
    }
    wizOriginal = '52a00d55cf1818f2be00000b';
    url = "/db/thang.type/" + wizOriginal + "/version";
    this.wizardType = new module.exports();
    this.wizardType.url = function() {
      return url;
    };
    this.wizardType.fetch();
    return this.wizardType;
  };

  ThangType.prototype.getPortraitURL = function() {
    var iconURL, rasterURL;
    if (iconURL = this.get('rasterIcon')) {
      return "/file/" + iconURL;
    }
    if (rasterURL = this.get('raster')) {
      return "/file/" + rasterURL;
    }
    return "/file/db/thang.type/" + (this.get('original')) + "/portrait.png";
  };

  ThangType.prototype.getAllowedSlots = function() {
    var itemComponentRef, ref;
    itemComponentRef = _.find(this.get('components') || [], function(compRef) {
      return compRef.original === LevelComponent.ItemID;
    });
    return (itemComponentRef != null ? (ref = itemComponentRef.config) != null ? ref.slots : void 0 : void 0) || ['right-hand'];
  };

  ThangType.prototype.getAllowedHeroClasses = function() {
    var heroClass;
    if (heroClass = this.get('heroClass')) {
      return [heroClass];
    }
    return ['Warrior', 'Ranger', 'Wizard'];
  };

  ThangType.prototype.getHeroStats = function() {
    var classAverage, className, classSpecificScore, components, equipsConfig, heroClass, i, len, maxSpeed, minSpeed, movesConfig, num, percent, pieces, programmableConfig, prop, rawNumbers, ref, ref1, ref2, ref3, ref4, ref5, skill, speedPoints, speedRange, stat, stats;
    if (!(heroClass = this.get('heroClass'))) {
      return;
    }
    components = this.get('components') || [];
    if (!(equipsConfig = (ref = _.find(components, {
      original: LevelComponent.EquipsID
    })) != null ? ref.config : void 0)) {
      return console.warn(this.get('name'), 'is not an equipping hero, but you are asking for its hero stats. (Did you project away components?)');
    }
    if (!(movesConfig = (ref1 = _.find(components, {
      original: LevelComponent.MovesID
    })) != null ? ref1.config : void 0)) {
      return console.warn(this.get('name'), 'is not a moving hero, but you are asking for its hero stats.');
    }
    if (!(programmableConfig = (ref2 = _.find(components, {
      original: LevelComponent.ProgrammableID
    })) != null ? ref2.config : void 0)) {
      return console.warn(this.get('name'), 'is not a Programmable hero, but you are asking for its hero stats.');
    }
    if (this.classStatAverages == null) {
      this.classStatAverages = {
        attack: {
          Warrior: 7.5,
          Ranger: 5,
          Wizard: 2.5
        },
        health: {
          Warrior: 7.5,
          Ranger: 5,
          Wizard: 3.5
        }
      };
    }
    stats = {};
    rawNumbers = {
      attack: (ref3 = equipsConfig.attackDamageFactor) != null ? ref3 : 1,
      health: (ref4 = equipsConfig.maxHealthFactor) != null ? ref4 : 1,
      speed: movesConfig.maxSpeed
    };
    ref5 = ['attack', 'health'];
    for (i = 0, len = ref5.length; i < len; i++) {
      prop = ref5[i];
      stat = rawNumbers[prop];
      if (stat < 1) {
        classSpecificScore = 10 - 5 / stat;
      } else {
        classSpecificScore = stat * 5;
      }
      classAverage = this.classStatAverages[prop][this.get('heroClass')];
      stats[prop] = {
        relative: Math.round(2 * ((classAverage - 2.5) + classSpecificScore / 2)) / 2 / 10,
        absolute: stat
      };
      pieces = (function() {
        var j, results;
        results = [];
        for (num = j = 1; j <= 3; num = ++j) {
          results.push($.i18n.t("choose_hero." + prop + "_" + num));
        }
        return results;
      })();
      percent = Math.round(stat * 100) + '%';
      className = $.i18n.t("general." + (_.string.slugify(this.get('heroClass'))));
      stats[prop].description = [pieces[0], percent, pieces[1], className, pieces[2]].join(' ');
    }
    minSpeed = 4;
    maxSpeed = 16;
    speedRange = maxSpeed - minSpeed;
    speedPoints = rawNumbers.speed - minSpeed;
    stats.speed = {
      relative: Math.round(20 * speedPoints / speedRange) / 2 / 10,
      absolute: rawNumbers.speed,
      description: ($.i18n.t('choose_hero.speed_1')) + " " + rawNumbers.speed + " " + ($.i18n.t('choose_hero.speed_2'))
    };
    stats.skills = (function() {
      var j, len1, ref6, results;
      ref6 = programmableConfig.programmableProperties;
      results = [];
      for (j = 0, len1 = ref6.length; j < len1; j++) {
        skill = ref6[j];
        if (skill !== 'say' && !/(Range|Pos|Radius|Damage)$/.test(skill)) {
          results.push(_.string.titleize(_.string.humanize(skill)));
        }
      }
      return results;
    })();
    return stats;
  };

  ThangType.prototype.getFrontFacingStats = function() {
    var component, components, config, dps, i, itemConfig, j, k, key, len, len1, len2, modifiers, props, ref, ref1, ref2, ref3, ref4, ref5, ref6, sortedStats, stat, statKeys, stats, value;
    components = this.get('components') || [];
    if (!(itemConfig = (ref = _.find(components, {
      original: LevelComponent.ItemID
    })) != null ? ref.config : void 0)) {
      console.warn(this.get('name'), 'is not an item, but you are asking for its stats.');
      return {
        props: [],
        stats: {}
      };
    }
    stats = {};
    props = (ref1 = itemConfig.programmableProperties) != null ? ref1 : [];
    props = props.concat((ref2 = itemConfig.moreProgrammableProperties) != null ? ref2 : []);
    props = _.without(props, 'canCast', 'spellNames', 'spells');
    ref4 = (ref3 = itemConfig.stats) != null ? ref3 : {};
    for (stat in ref4) {
      modifiers = ref4[stat];
      stats[stat] = this.formatStatDisplay(stat, modifiers);
    }
    ref6 = (ref5 = itemConfig.extraHUDProperties) != null ? ref5 : [];
    for (i = 0, len = ref6.length; i < len; i++) {
      stat = ref6[i];
      if (stats[stat] == null) {
        stats[stat] = null;
      }
    }
    for (j = 0, len1 = components.length; j < len1; j++) {
      component = components[j];
      if (!(config = component.config)) {
        continue;
      }
      for (stat in stats) {
        value = stats[stat];
        if (!(value == null)) {
          continue;
        }
        value = config[stat];
        if (value == null) {
          continue;
        }
        stats[stat] = this.formatStatDisplay(stat, {
          setTo: value
        });
        if (stat === 'attackDamage') {
          dps = (value / (config.cooldown || 0.5)).toFixed(1);
          stats[stat].display += " (" + dps + " DPS)";
        }
      }
      if (config.programmableSnippets) {
        props = props.concat(config.programmableSnippets);
      }
    }
    for (stat in stats) {
      value = stats[stat];
      if (value == null) {
        stats[stat] = {
          name: stat,
          display: '???'
        };
      }
    }
    statKeys = _.keys(stats);
    statKeys.sort();
    props.sort();
    sortedStats = {};
    for (k = 0, len2 = statKeys.length; k < len2; k++) {
      key = statKeys[k];
      sortedStats[key] = stats[key];
    }
    return {
      props: props,
      stats: sortedStats
    };
  };

  ThangType.prototype.formatStatDisplay = function(name, modifiers) {
    var display, format, i18nKey, matchedShortName, value;
    i18nKey = {
      maxHealth: 'health',
      maxSpeed: 'speed',
      healthReplenishRate: 'regeneration',
      attackDamage: 'attack',
      attackRange: 'range',
      shieldDefenseFactor: 'blocks',
      visualRange: 'range',
      throwDamage: 'attack',
      throwRange: 'range',
      bashDamage: 'attack',
      backstabDamage: 'backstab'
    }[name];
    if (i18nKey) {
      name = $.i18n.t('choose_hero.' + i18nKey);
      matchedShortName = true;
    } else {
      name = _.string.humanize(name);
      matchedShortName = false;
    }
    format = '';
    if (/(range|radius|distance|vision)$/i.test(name)) {
      format = 'm';
    }
    if (/cooldown$/i.test(name)) {
      format || (format = 's');
    }
    if (/speed$/i.test(name)) {
      format || (format = 'm/s');
    }
    if (/(regeneration| rate)$/i.test(name)) {
      format || (format = '/s');
    }
    value = modifiers.setTo;
    if (/(blocks)$/i.test(name)) {
      format || (format = '%');
      value = (value * 100).toFixed(1);
    }
    if (_.isArray(value)) {
      value = value.join(', ');
    }
    display = [];
    if (value != null) {
      display.push("" + value + format);
    }
    if (modifiers.addend > 0) {
      display.push("+" + modifiers.addend + format);
    }
    if (modifiers.addend < 0) {
      display.push("" + modifiers.addend + format);
    }
    if ((modifiers.factor != null) && modifiers.factor !== 1) {
      display.push("x" + modifiers.factor);
    }
    display = display.join(', ');
    display = display.replace(/9001m?/, 'Infinity');
    return {
      name: name,
      display: display,
      matchedShortName: matchedShortName
    };
  };

  ThangType.prototype.isSilhouettedItem = function() {
    var expectedTotalGems, points, tier;
    if (!((this.get('gems') != null) || (this.get('tier') != null))) {
      return console.error("Trying to determine whether " + (this.get('name')) + " should be a silhouetted item, but it has no gem cost.");
    }
    if (this.get('tier') == null) {
      console.info("Add (or make sure you have fetched) a tier for " + (this.get('name')) + " to more accurately determine whether it is silhouetted.");
    }
    tier = this.get('tier');
    if (tier != null) {
      return this.levelRequiredForItem() > me.level();
    }
    points = me.get('points');
    expectedTotalGems = (points != null ? points : 0) * 1.5;
    return this.get('gems') > (100 + expectedTotalGems) * 1.2;
  };

  ThangType.prototype.levelRequiredForItem = function() {
    var itemTier, playerLevel, playerTier;
    if (this.get('tier') == null) {
      return console.error("Trying to determine what level is required for " + (this.get('name')) + ", but it has no tier.");
    }
    itemTier = this.get('tier');
    playerTier = itemTier / 2.5;
    playerLevel = me.constructor.levelForTier(playerTier);
    return playerLevel;
  };

  ThangType.prototype.getContainersForAnimation = function(animation, action) {
    var containers, i, len, rawAnimation, ref;
    rawAnimation = this.get('raw').animations[animation];
    if (!rawAnimation) {
      console.error('thang type', this.get('name'), 'is missing animation', animation, 'from action', action);
    }
    containers = rawAnimation.containers;
    ref = this.get('raw').animations[animation].animations;
    for (i = 0, len = ref.length; i < len; i++) {
      animation = ref[i];
      containers = containers.concat(this.getContainersForAnimation(animation.gn, action));
    }
    return containers;
  };

  ThangType.prototype.getContainersForActions = function(actionNames) {
    var action, actionName, actions, animationContainers, container, containersToRender, i, j, len, len1;
    containersToRender = {};
    actions = this.getActions();
    for (i = 0, len = actionNames.length; i < len; i++) {
      actionName = actionNames[i];
      action = _.find(actions, {
        name: actionName
      });
      if (action.container) {
        containersToRender[action.container] = true;
      } else if (action.animation) {
        animationContainers = this.getContainersForAnimation(action.animation, action);
        for (j = 0, len1 = animationContainers.length; j < len1; j++) {
          container = animationContainers[j];
          containersToRender[container.gn] = true;
        }
      }
    }
    return _.keys(containersToRender);
  };

  ThangType.prototype.nextForAction = function(action) {
    var next;
    next = true;
    if (action.goesTo) {
      next = action.goesTo;
    }
    if (action.loops === false) {
      next = false;
    }
    return next;
  };

  ThangType.prototype.initPrerenderedSpriteSheets = function() {
    var data;
    if (this.prerenderedSpriteSheets || !(data = this.get('prerenderedSpriteSheetData'))) {
      return;
    }
    return this.prerenderedSpriteSheets = new PrerenderedSpriteSheets(data);
  };

  ThangType.prototype.getPrerenderedSpriteSheet = function(colorConfig, defaultSpriteType) {
    var spriteType;
    if (!this.prerenderedSpriteSheets) {
      return;
    }
    spriteType = this.get('spriteType') || defaultSpriteType;
    return this.prerenderedSpriteSheets.find(function(pss) {
      var getHue, otherColorConfig;
      if (pss.get('spriteType') !== spriteType) {
        return false;
      }
      otherColorConfig = pss.get('colorConfig');
      if (_.isEmpty(colorConfig) && _.isEmpty(otherColorConfig)) {
        return true;
      }
      getHue = function(config) {
        return _.result(_.result(config, 'team'), 'hue');
      };
      return getHue(colorConfig) === getHue(otherColorConfig);
    });
  };

  ThangType.prototype.getPrerenderedSpriteSheetToLoad = function() {
    if (!this.prerenderedSpriteSheets) {
      return;
    }
    return this.prerenderedSpriteSheets.find(function(pss) {
      return pss.needToLoad && !pss.loadedImage;
    });
  };

  return ThangType;

})(CocoModel);

PrerenderedSpriteSheet = (function(superClass) {
  extend(PrerenderedSpriteSheet, superClass);

  function PrerenderedSpriteSheet() {
    return PrerenderedSpriteSheet.__super__.constructor.apply(this, arguments);
  }

  PrerenderedSpriteSheet.className = 'PrerenderedSpriteSheet';

  PrerenderedSpriteSheet.prototype.loadImage = function() {
    var imageURL;
    if (this.loadingImage || this.loadedImage) {
      return false;
    }
    if (!(imageURL = this.get('image'))) {
      return false;
    }
    this.image = $("<img src='/file/" + imageURL + "' />");
    this.loadingImage = true;
    this.image.one('load', (function(_this) {
      return function() {
        _this.loadingImage = false;
        _this.loadedImage = true;
        _this.buildSpriteSheet();
        return _this.trigger('image-loaded', _this);
      };
    })(this));
    this.image.one('error', (function(_this) {
      return function() {
        _this.loadingImage = false;
        return _this.trigger('image-load-error', _this);
      };
    })(this));
    return true;
  };

  PrerenderedSpriteSheet.prototype.buildSpriteSheet = function() {
    return this.spriteSheet = new createjs.SpriteSheet({
      images: [this.image[0]],
      frames: this.get('frames'),
      animations: this.get('animations')
    });
  };

  PrerenderedSpriteSheet.prototype.markToLoad = function() {
    return this.needToLoad = true;
  };

  PrerenderedSpriteSheet.prototype.needToLoad = false;

  PrerenderedSpriteSheet.prototype.loadedImage = false;

  PrerenderedSpriteSheet.prototype.loadingImage = false;

  return PrerenderedSpriteSheet;

})(CocoModel);

PrerenderedSpriteSheets = (function(superClass) {
  extend(PrerenderedSpriteSheets, superClass);

  function PrerenderedSpriteSheets() {
    return PrerenderedSpriteSheets.__super__.constructor.apply(this, arguments);
  }

  PrerenderedSpriteSheets.prototype.model = PrerenderedSpriteSheet;

  return PrerenderedSpriteSheets;

})(CocoCollection);
});

;require.register("models/TrialRequest", function(exports, require, module) {
var CocoModel, TrialRequest, schema,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

schema = require('schemas/models/trial_request.schema');

module.exports = TrialRequest = (function(superClass) {
  extend(TrialRequest, superClass);

  function TrialRequest() {
    return TrialRequest.__super__.constructor.apply(this, arguments);
  }

  TrialRequest.className = 'TrialRequest';

  TrialRequest.schema = schema;

  TrialRequest.prototype.urlRoot = '/db/trial.request';

  TrialRequest.prototype.nameString = function() {
    var props, values;
    props = this.get('properties');
    values = _.filter(_.at(props, 'name', 'email'));
    return values.join(' / ');
  };

  TrialRequest.prototype.locationString = function() {
    var props, values;
    props = this.get('properties');
    values = _.filter(_.at(props, 'city', 'state', 'country'));
    return values.join(' ');
  };

  TrialRequest.prototype.educationLevelString = function() {
    var levels;
    levels = this.get('properties').educationLevel || [];
    return levels.join(', ');
  };

  return TrialRequest;

})(CocoModel);
});

;require.register("models/User", function(exports, require, module) {
var CocoModel, GRAVATAR_URL, Level, ThangType, User, cache, tiersByLevel, util, utils,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

GRAVATAR_URL = 'https://www.gravatar.com/';

cache = {};

CocoModel = require('./CocoModel');

util = require('core/utils');

ThangType = require('./ThangType');

Level = require('./Level');

utils = require('core/utils');

module.exports = User = (function(superClass) {
  var a, b, c;

  extend(User, superClass);

  function User() {
    return User.__super__.constructor.apply(this, arguments);
  }

  User.className = 'User';

  User.schema = require('schemas/models/user');

  User.prototype.urlRoot = '/db/user';

  User.prototype.notyErrors = false;

  User.prototype.isAdmin = function() {
    return indexOf.call(this.get('permissions', true), 'admin') >= 0;
  };

  User.prototype.isArtisan = function() {
    return indexOf.call(this.get('permissions', true), 'artisan') >= 0;
  };

  User.prototype.isInGodMode = function() {
    return indexOf.call(this.get('permissions', true), 'godmode') >= 0;
  };

  User.prototype.isAnonymous = function() {
    return this.get('anonymous', true);
  };

  User.prototype.displayName = function() {
    return this.get('name', true);
  };

  User.prototype.broadName = function() {
    var emailDomain, emailName, name, ref, ref1;
    if (this.get('deleted')) {
      return '(deleted)';
    }
    name = _.filter([this.get('firstName'), this.get('lastName')]).join(' ');
    if (name) {
      return name;
    }
    name = this.get('name');
    if (name) {
      return name;
    }
    ref1 = ((ref = this.get('email')) != null ? ref.split('@') : void 0) || [], emailName = ref1[0], emailDomain = ref1[1];
    if (emailName) {
      return emailName;
    }
    return 'Anonymous';
  };

  User.prototype.getPhotoURL = function(size, useJobProfilePhoto, useEmployerPageAvatar) {
    var photoURL, prefix, ref;
    if (size == null) {
      size = 80;
    }
    if (useJobProfilePhoto == null) {
      useJobProfilePhoto = false;
    }
    if (useEmployerPageAvatar == null) {
      useEmployerPageAvatar = false;
    }
    photoURL = useJobProfilePhoto ? (ref = this.get('jobProfile')) != null ? ref.photoURL : void 0 : null;
    photoURL || (photoURL = this.get('photoURL'));
    if (photoURL) {
      prefix = photoURL.search(/\?/) === -1 ? '?' : '&';
      if (photoURL.search('http') !== -1) {
        return "" + photoURL + prefix + "s=" + size;
      }
      return "/file/" + photoURL + prefix + "s=" + size;
    }
    return "/db/user/" + this.id + "/avatar?s=" + size + "&employerPageAvatar=" + useEmployerPageAvatar;
  };

  User.prototype.getRequestVerificationEmailURL = function() {
    return this.url() + "/request-verify-email";
  };

  User.prototype.getSlugOrID = function() {
    return this.get('slug') || this.get('_id');
  };

  User.prototype.set = function() {
    if (arguments[0] === 'jobProfileApproved' && this.get("jobProfileApproved") === false && !this.get("jobProfileApprovedDate")) {
      this.set("jobProfileApprovedDate", (new Date()).toISOString());
    }
    return User.__super__.set.apply(this, arguments);
  };

  User.getUnconflictedName = function(name, done) {
    return $.ajax("/auth/name/" + (encodeURIComponent(name)), {
      cache: false,
      success: function(data) {
        return done(data.suggestedName);
      }
    });
  };

  User.checkNameConflicts = function(name) {
    return new Promise(function(resolve, reject) {
      return $.ajax("/auth/name/" + (encodeURIComponent(name)), {
        cache: false,
        success: resolve,
        error: function(jqxhr) {
          return reject(jqxhr.responseJSON);
        }
      });
    });
  };

  User.checkEmailExists = function(email) {
    return new Promise(function(resolve, reject) {
      return $.ajax("/auth/email/" + (encodeURIComponent(email)), {
        cache: false,
        success: resolve,
        error: function(jqxhr) {
          return reject(jqxhr.responseJSON);
        }
      });
    });
  };

  User.prototype.getEnabledEmails = function() {
    var emailDoc, emailName, ref, results;
    ref = this.get('emails', true);
    results = [];
    for (emailName in ref) {
      emailDoc = ref[emailName];
      if (emailDoc.enabled) {
        results.push(emailName);
      }
    }
    return results;
  };

  User.prototype.setEmailSubscription = function(name, enabled) {
    var newSubs;
    newSubs = _.clone(this.get('emails')) || {};
    (newSubs[name] != null ? newSubs[name] : newSubs[name] = {}).enabled = enabled;
    return this.set('emails', newSubs);
  };

  User.prototype.isEmailSubscriptionEnabled = function(name) {
    var ref;
    return (ref = (this.get('emails') || {})[name]) != null ? ref.enabled : void 0;
  };

  User.prototype.isStudent = function() {
    return this.get('role') === 'student';
  };

  User.prototype.isTeacher = function() {
    var ref;
    return (ref = this.get('role')) === 'teacher' || ref === 'technology coordinator' || ref === 'advisor' || ref === 'principal' || ref === 'superintendent' || ref === 'parent';
  };

  User.prototype.isSessionless = function() {
    return Boolean((utils.getQueryVariable('dev', false) || me.isTeacher()) && utils.getQueryVariable('course', false));
  };

  User.prototype.setRole = function(role, force) {
    var oldRole, ref;
    if (force == null) {
      force = false;
    }
    oldRole = this.get('role');
    if (oldRole === role || (oldRole && !force)) {
      return;
    }
    this.set('role', role);
    this.patch();
    if ((ref = application.tracker) != null) {
      ref.updateRole();
    }
    return this.get('role');
  };

  a = 5;

  b = 100;

  c = b;

  User.levelFromExp = function(xp) {
    if (xp > 0) {
      return Math.floor(a * Math.log((1 / b) * (xp + c))) + 1;
    } else {
      return 1;
    }
  };

  User.expForLevel = function(level) {
    if (level > 1) {
      return Math.ceil(Math.exp((level - 1) / a) * b - c);
    } else {
      return 0;
    }
  };

  User.tierFromLevel = function(level) {
    return tiersByLevel[Math.min(level, tiersByLevel.length - 1)];
  };

  User.levelForTier = function(tier) {
    var i, len, level, tierThreshold;
    for (level = i = 0, len = tiersByLevel.length; i < len; level = ++i) {
      tierThreshold = tiersByLevel[level];
      if (tierThreshold >= tier) {
        return level;
      }
    }
  };

  User.prototype.level = function() {
    var totalPoint;
    totalPoint = this.get('points');
    if (me.isInGodMode()) {
      totalPoint = totalPoint + 1000000;
    }
    return User.levelFromExp(totalPoint);
  };

  User.prototype.tier = function() {
    return User.tierFromLevel(this.level());
  };

  User.prototype.gems = function() {
    var gemsEarned, gemsPurchased, gemsSpent, ref, ref1, ref2, ref3, ref4;
    gemsEarned = (ref = (ref1 = this.get('earned')) != null ? ref1.gems : void 0) != null ? ref : 0;
    if (me.isInGodMode()) {
      gemsEarned = gemsEarned + 100000;
    }
    gemsPurchased = (ref2 = (ref3 = this.get('purchased')) != null ? ref3.gems : void 0) != null ? ref2 : 0;
    gemsSpent = (ref4 = this.get('spent')) != null ? ref4 : 0;
    return Math.floor(gemsEarned + gemsPurchased - gemsSpent);
  };

  User.prototype.heroes = function() {
    var heroes, ref, ref1;
    heroes = ((ref = (ref1 = me.get('purchased')) != null ? ref1.heroes : void 0) != null ? ref : []).concat([ThangType.heroes.captain, ThangType.heroes.knight, ThangType.heroes.champion, ThangType.heroes.duelist]);
    return heroes;
  };

  User.prototype.items = function() {
    var ref, ref1, ref2, ref3;
    return ((ref2 = (ref3 = me.get('earned')) != null ? ref3.items : void 0) != null ? ref2 : []).concat((ref = (ref1 = me.get('purchased')) != null ? ref1.items : void 0) != null ? ref : []).concat([ThangType.items['simple-boots']]);
  };

  User.prototype.levels = function() {
    var ref, ref1, ref2, ref3;
    return ((ref2 = (ref3 = me.get('earned')) != null ? ref3.levels : void 0) != null ? ref2 : []).concat((ref = (ref1 = me.get('purchased')) != null ? ref1.levels : void 0) != null ? ref : []).concat(Level.levels['dungeons-of-kithgard']);
  };

  User.prototype.ownsHero = function(heroOriginal) {
    return me.isInGodMode() || indexOf.call(this.heroes(), heroOriginal) >= 0;
  };

  User.prototype.ownsItem = function(itemOriginal) {
    return indexOf.call(this.items(), itemOriginal) >= 0;
  };

  User.prototype.ownsLevel = function(levelOriginal) {
    return indexOf.call(this.levels(), levelOriginal) >= 0;
  };

  User.prototype.getHeroClasses = function() {
    var heroClass, heroSlugs, id, idsToSlugs, myHeroClasses, myHeroSlugs, ref;
    idsToSlugs = _.invert(ThangType.heroes);
    myHeroSlugs = (function() {
      var i, len, ref, results;
      ref = this.heroes();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        id = ref[i];
        results.push(idsToSlugs[id]);
      }
      return results;
    }).call(this);
    myHeroClasses = [];
    ref = ThangType.heroClasses;
    for (heroClass in ref) {
      heroSlugs = ref[heroClass];
      if (_.intersection(myHeroSlugs, heroSlugs).length) {
        myHeroClasses.push(heroClass);
      }
    }
    return myHeroClasses;
  };

  User.prototype.getAnnouncesActionAudioGroup = function() {
    var group;
    if (this.announcesActionAudioGroup) {
      return this.announcesActionAudioGroup;
    }
    group = me.get('testGroupNumber') % 4;
    this.announcesActionAudioGroup = (function() {
      switch (group) {
        case 0:
          return 'all-audio';
        case 1:
          return 'no-audio';
        case 2:
          return 'just-take-damage';
        case 3:
          return 'without-take-damage';
      }
    })();
    if (me.isAdmin()) {
      this.announcesActionAudioGroup = 'all-audio';
    }
    if (!me.isAdmin()) {
      application.tracker.identify({
        announcesActionAudioGroup: this.announcesActionAudioGroup
      });
    }
    return this.announcesActionAudioGroup;
  };

  User.prototype.getCampaignAdsGroup = function() {
    if (this.campaignAdsGroup) {
      return this.campaignAdsGroup;
    }
    this.campaignAdsGroup = 'leaderboard-ads';
    if (me.isAdmin()) {
      this.campaignAdsGroup = 'no-ads';
    }
    if (!me.isAdmin()) {
      application.tracker.identify({
        campaignAdsGroup: this.campaignAdsGroup
      });
    }
    return this.campaignAdsGroup;
  };

  User.prototype.getFourthLevelGroup = function() {
    var group;
    return 'forgetful-gemsmith';
    if (this.fourthLevelGroup) {
      return this.fourthLevelGroup;
    }
    group = me.get('testGroupNumber') % 8;
    this.fourthLevelGroup = (function() {
      switch (group) {
        case 0:
        case 1:
        case 2:
        case 3:
          return 'signs-and-portents';
        case 4:
        case 5:
        case 6:
        case 7:
          return 'forgetful-gemsmith';
      }
    })();
    if (me.isAdmin()) {
      this.fourthLevelGroup = 'signs-and-portents';
    }
    if (!me.isAdmin()) {
      application.tracker.identify({
        fourthLevelGroup: this.fourthLevelGroup
      });
    }
    return this.fourthLevelGroup;
  };

  User.prototype.getHintsGroup = function() {
    var group;
    if (this.hintsGroup) {
      return this.hintsGroup;
    }
    group = me.get('testGroupNumber') % 3;
    this.hintsGroup = (function() {
      switch (group) {
        case 0:
          return 'no-hints';
        case 1:
          return 'hints';
        case 2:
          return 'hintsB';
      }
    })();
    if (me.isAdmin()) {
      this.hintsGroup = 'hints';
    }
    if (!me.isAdmin()) {
      application.tracker.identify({
        hintsGroup: this.hintsGroup
      });
    }
    return this.hintsGroup;
  };

  User.prototype.getDefaultLanguageGroup = function() {
    var group;
    if (this.defaultLanguageGroup) {
      return this.defaultLanguageGroup;
    }
    group = me.get('testGroupNumber') % 2;
    this.defaultLanguageGroup = (function() {
      switch (group) {
        case 0:
          return 'javascript';
        case 1:
          return 'python';
      }
    })();
    if (!me.isAdmin()) {
      application.tracker.identify({
        defaultLanguageGroup: this.defaultLanguageGroup
      });
    }
    return this.defaultLanguageGroup;
  };

  User.prototype.getVideoTutorialStylesIndex = function(numVideos) {
    if (numVideos == null) {
      numVideos = 0;
    }
    if (!(numVideos > 0)) {
      return 0;
    }
    return me.get('testGroupNumber') % numVideos;
  };

  User.prototype.hasSubscription = function() {
    var stripe;
    if (!(stripe = this.get('stripe'))) {
      return false;
    }
    if (stripe.sponsorID) {
      return true;
    }
    if (stripe.subscriptionID) {
      return true;
    }
    if (stripe.free === true) {
      return true;
    }
    if (_.isString(stripe.free) && new Date() < new Date(stripe.free)) {
      return true;
    }
  };

  User.prototype.isPremium = function() {
    if (me.isInGodMode()) {
      return true;
    }
    if (me.isAdmin()) {
      return true;
    }
    if (me.hasSubscription()) {
      return true;
    }
    return false;
  };

  User.prototype.isOnPremiumServer = function() {
    var ref, ref1;
    if ((ref = me.get('country')) === 'brazil') {
      return true;
    }
    if (((ref1 = me.get('country')) === 'china') && (me.isPremium() || me.get('stripe'))) {
      return true;
    }
    return false;
  };

  User.prototype.isOnFreeOnlyServer = function() {
    var ref;
    if (((ref = me.get('country')) === 'china') && !(me.isPremium() || me.get('stripe'))) {
      return true;
    }
    return false;
  };

  User.prototype.sendVerificationCode = function(code) {
    return $.ajax({
      method: 'POST',
      url: "/db/user/" + this.id + "/verify/" + code,
      success: (function(_this) {
        return function(attributes) {
          _this.set(attributes);
          return _this.trigger('email-verify-success');
        };
      })(this),
      error: (function(_this) {
        return function() {
          return _this.trigger('email-verify-error');
        };
      })(this)
    });
  };

  User.prototype.isEnrolled = function() {
    return this.prepaidStatus() === 'enrolled';
  };

  User.prototype.prepaidStatus = function() {
    var coursePrepaid;
    coursePrepaid = this.get('coursePrepaid');
    if (!coursePrepaid) {
      return 'not-enrolled';
    }
    if (!coursePrepaid.endDate) {
      return 'enrolled';
    }
    if (coursePrepaid.endDate > new Date().toISOString()) {
      return 'enrolled';
    } else {
      return 'expired';
    }
  };

  User.prototype.spy = function(user, options) {
    if (options == null) {
      options = {};
    }
    user = user.id || user;
    options.url = '/auth/spy';
    options.type = 'POST';
    if (options.data == null) {
      options.data = {};
    }
    options.data.user = user;
    return this.fetch(options);
  };

  User.prototype.stopSpying = function(options) {
    if (options == null) {
      options = {};
    }
    options.url = '/auth/stop-spying';
    options.type = 'POST';
    return this.fetch(options);
  };

  User.prototype.logout = function(options) {
    if (options == null) {
      options = {};
    }
    options.type = 'POST';
    options.url = '/auth/logout';
    if (typeof FB !== "undefined" && FB !== null) {
      if (typeof FB.logout === "function") {
        FB.logout();
      }
    }
    if (options.success == null) {
      options.success = function() {
        var location;
        location = _.result(currentView, 'logoutRedirectURL');
        if (location) {
          return window.location = location;
        } else {
          return window.location.reload();
        }
      };
    }
    return this.fetch(options);
  };

  User.prototype.signupWithPassword = function(name, email, password, options) {
    var jqxhr;
    if (options == null) {
      options = {};
    }
    options.url = _.result(this, 'url') + '/signup-with-password';
    options.type = 'POST';
    if (options.data == null) {
      options.data = {};
    }
    _.extend(options.data, {
      name: name,
      email: email,
      password: password
    });
    options.contentType = 'application/json';
    options.data = JSON.stringify(options.data);
    jqxhr = this.fetch(options);
    jqxhr.then(function() {
      var ref;
      return (ref = window.tracker) != null ? ref.trackEvent('Finished Signup', {
        category: "Signup",
        label: 'CodeCombat'
      }) : void 0;
    });
    return jqxhr;
  };

  User.prototype.signupWithFacebook = function(name, email, facebookID, options) {
    var jqxhr;
    if (options == null) {
      options = {};
    }
    options.url = _.result(this, 'url') + '/signup-with-facebook';
    options.type = 'POST';
    if (options.data == null) {
      options.data = {};
    }
    _.extend(options.data, {
      name: name,
      email: email,
      facebookID: facebookID,
      facebookAccessToken: application.facebookHandler.token()
    });
    options.contentType = 'application/json';
    options.data = JSON.stringify(options.data);
    jqxhr = this.fetch(options);
    jqxhr.then(function() {
      var ref, ref1;
      if ((ref = window.tracker) != null) {
        ref.trackEvent('Facebook Login', {
          category: "Signup",
          label: 'Facebook'
        });
      }
      return (ref1 = window.tracker) != null ? ref1.trackEvent('Finished Signup', {
        category: "Signup",
        label: 'Facebook'
      }) : void 0;
    });
    return jqxhr;
  };

  User.prototype.signupWithGPlus = function(name, email, gplusID, options) {
    var jqxhr;
    if (options == null) {
      options = {};
    }
    options.url = _.result(this, 'url') + '/signup-with-gplus';
    options.type = 'POST';
    if (options.data == null) {
      options.data = {};
    }
    _.extend(options.data, {
      name: name,
      email: email,
      gplusID: gplusID,
      gplusAccessToken: application.gplusHandler.token()
    });
    options.contentType = 'application/json';
    options.data = JSON.stringify(options.data);
    jqxhr = this.fetch(options);
    jqxhr.then(function() {
      var ref, ref1;
      if ((ref = window.tracker) != null) {
        ref.trackEvent('Google Login', {
          category: "Signup",
          label: 'GPlus'
        });
      }
      return (ref1 = window.tracker) != null ? ref1.trackEvent('Finished Signup', {
        category: "Signup",
        label: 'GPlus'
      }) : void 0;
    });
    return jqxhr;
  };

  User.prototype.fetchGPlusUser = function(gplusID, options) {
    if (options == null) {
      options = {};
    }
    if (options.data == null) {
      options.data = {};
    }
    options.data.gplusID = gplusID;
    options.data.gplusAccessToken = application.gplusHandler.token();
    return this.fetch(options);
  };

  User.prototype.loginGPlusUser = function(gplusID, options) {
    if (options == null) {
      options = {};
    }
    options.url = '/auth/login-gplus';
    options.type = 'POST';
    if (options.data == null) {
      options.data = {};
    }
    options.data.gplusID = gplusID;
    options.data.gplusAccessToken = application.gplusHandler.token();
    return this.fetch(options);
  };

  User.prototype.fetchFacebookUser = function(facebookID, options) {
    if (options == null) {
      options = {};
    }
    if (options.data == null) {
      options.data = {};
    }
    options.data.facebookID = facebookID;
    options.data.facebookAccessToken = application.facebookHandler.token();
    return this.fetch(options);
  };

  User.prototype.loginFacebookUser = function(facebookID, options) {
    if (options == null) {
      options = {};
    }
    options.url = '/auth/login-facebook';
    options.type = 'POST';
    if (options.data == null) {
      options.data = {};
    }
    options.data.facebookID = facebookID;
    options.data.facebookAccessToken = application.facebookHandler.token();
    return this.fetch(options);
  };

  User.prototype.loginPasswordUser = function(usernameOrEmail, password, options) {
    if (options == null) {
      options = {};
    }
    options.url = '/auth/login';
    options.type = 'POST';
    if (options.data == null) {
      options.data = {};
    }
    _.extend(options.data, {
      username: usernameOrEmail,
      password: password
    });
    return this.fetch(options);
  };

  User.prototype.makeCoursePrepaid = function() {
    var Prepaid, coursePrepaid;
    coursePrepaid = this.get('coursePrepaid');
    if (!coursePrepaid) {
      return null;
    }
    Prepaid = require('models/Prepaid');
    return new Prepaid(coursePrepaid);
  };

  User.prototype.becomeStudent = function(options) {
    if (options == null) {
      options = {};
    }
    options.url = '/db/user/-/become-student';
    options.type = 'PUT';
    return this.fetch(options);
  };

  User.prototype.remainTeacher = function(options) {
    if (options == null) {
      options = {};
    }
    options.url = '/db/user/-/remain-teacher';
    options.type = 'PUT';
    return this.fetch(options);
  };

  User.prototype.destudent = function(options) {
    if (options == null) {
      options = {};
    }
    options.url = _.result(this, 'url') + '/destudent';
    options.type = 'POST';
    return this.fetch(options);
  };

  User.prototype.deteacher = function(options) {
    if (options == null) {
      options = {};
    }
    options.url = _.result(this, 'url') + '/deteacher';
    options.type = 'POST';
    return this.fetch(options);
  };

  User.prototype.checkForNewAchievement = function(options) {
    var jqxhr;
    if (options == null) {
      options = {};
    }
    options.url = _.result(this, 'url') + '/check-for-new-achievement';
    options.type = 'POST';
    jqxhr = this.fetch(options);
    this.loading = false;
    return jqxhr;
  };

  return User;

})(CocoModel);

tiersByLevel = [-1, 0, 0.05, 0.14, 0.18, 0.32, 0.41, 0.5, 0.64, 0.82, 0.91, 1.04, 1.22, 1.35, 1.48, 1.65, 1.78, 1.96, 2.1, 2.24, 2.38, 2.55, 2.69, 2.86, 3.03, 3.16, 3.29, 3.42, 3.58, 3.74, 3.89, 4.04, 4.19, 4.32, 4.47, 4.64, 4.79, 4.96, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15];
});

;require.register("models/UserCodeProblem", function(exports, require, module) {
var CocoModel, UserCodeProblem,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

module.exports = UserCodeProblem = (function(superClass) {
  extend(UserCodeProblem, superClass);

  function UserCodeProblem() {
    return UserCodeProblem.__super__.constructor.apply(this, arguments);
  }

  UserCodeProblem.className = 'UserCodeProblem';

  UserCodeProblem.schema = require('schemas/models/user_code_problem');

  UserCodeProblem.prototype.urlRoot = '/db/user.code.problem';

  return UserCodeProblem;

})(CocoModel);
});

;require.register("models/UserPollsRecord", function(exports, require, module) {
var CocoModel, UserPollsRecord, schema,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('./CocoModel');

schema = require('schemas/models/user-polls-record.schema');

module.exports = UserPollsRecord = (function(superClass) {
  extend(UserPollsRecord, superClass);

  function UserPollsRecord() {
    return UserPollsRecord.__super__.constructor.apply(this, arguments);
  }

  UserPollsRecord.className = 'UserPollsRecord';

  UserPollsRecord.schema = schema;

  UserPollsRecord.prototype.urlRoot = '/db/user.polls.record';

  return UserPollsRecord;

})(CocoModel);
});

;require.register("collections/Achievements", function(exports, require, module) {
var Achievement, AchievementCollection, CocoCollection,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoCollection = require('collections/CocoCollection');

Achievement = require('models/Achievement');

module.exports = AchievementCollection = (function(superClass) {
  extend(AchievementCollection, superClass);

  function AchievementCollection() {
    return AchievementCollection.__super__.constructor.apply(this, arguments);
  }

  AchievementCollection.prototype.url = '/db/achievement';

  AchievementCollection.prototype.model = Achievement;

  AchievementCollection.prototype.fetchRelatedToLevel = function(levelOriginal, options) {
    options = _.extend({
      data: {}
    }, options);
    options.data.related = levelOriginal;
    return this.fetch(options);
  };

  return AchievementCollection;

})(CocoCollection);
});

;require.register("collections/Campaigns", function(exports, require, module) {
var Campaign, Campaigns, CocoCollection,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Campaign = require('models/Campaign');

CocoCollection = require('collections/CocoCollection');

module.exports = Campaigns = (function(superClass) {
  extend(Campaigns, superClass);

  function Campaigns() {
    return Campaigns.__super__.constructor.apply(this, arguments);
  }

  Campaigns.prototype.model = Campaign;

  Campaigns.prototype.url = '/db/campaign';

  Campaigns.prototype.fetchByType = function(type, options) {
    if (options == null) {
      options = {};
    }
    if (options.data == null) {
      options.data = {};
    }
    options.data.type = type;
    return this.fetch(options);
  };

  return Campaigns;

})(CocoCollection);
});

;require.register("collections/Classrooms", function(exports, require, module) {
var Classroom, Classrooms, CocoCollection,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Classroom = require('models/Classroom');

CocoCollection = require('collections/CocoCollection');

module.exports = Classrooms = (function(superClass) {
  extend(Classrooms, superClass);

  function Classrooms() {
    return Classrooms.__super__.constructor.apply(this, arguments);
  }

  Classrooms.prototype.model = Classroom;

  Classrooms.prototype.url = '/db/classroom';

  Classrooms.prototype.initialize = function() {
    this.on('sync', (function(_this) {
      return function() {
        var classroom, i, len, ref, results;
        ref = _this.models;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          classroom = ref[i];
          results.push(classroom.capitalizeLanguageName());
        }
        return results;
      };
    })(this));
    return Classrooms.__super__.initialize.apply(this, arguments);
  };

  Classrooms.prototype.fetchMine = function(options) {
    if (options == null) {
      options = {};
    }
    if (options.data == null) {
      options.data = {};
    }
    options.data.ownerID = me.id;
    return this.fetch(options);
  };

  Classrooms.prototype.fetchByOwner = function(ownerID, options) {
    if (options == null) {
      options = {};
    }
    if (options.data == null) {
      options.data = {};
    }
    options.data.ownerID = ownerID;
    return this.fetch(options);
  };

  return Classrooms;

})(CocoCollection);
});

;require.register("collections/CocoCollection", function(exports, require, module) {
var CocoCollection, CocoModel,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoModel = require('models/CocoModel');

module.exports = CocoCollection = (function(superClass) {
  extend(CocoCollection, superClass);

  function CocoCollection() {
    return CocoCollection.__super__.constructor.apply(this, arguments);
  }

  CocoCollection.prototype.loaded = false;

  CocoCollection.prototype.model = null;

  CocoCollection.prototype.initialize = function(models, options) {
    var ref;
    if (options == null) {
      options = {};
    }
    if (this.model == null) {
      this.model = options.model;
    }
    if (!this.model) {
      console.error(this.constructor.name, 'does not have a model defined. This will not do!');
    }
    CocoCollection.__super__.initialize.call(this, models, options);
    this.setProjection(options.project);
    if (options.url) {
      this.url = options.url;
    }
    this.once('sync', (function(_this) {
      return function() {
        var i, len, model, ref, results;
        _this.loaded = true;
        ref = _this.models;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          model = ref[i];
          results.push(model.loaded = true);
        }
        return results;
      };
    })(this));
    if ((ref = window.application) != null ? ref.testing : void 0) {
      this.fakeRequests = [];
      return this.on('request', function() {
        return this.fakeRequests.push(jasmine.Ajax.requests.mostRecent());
      });
    }
  };

  CocoCollection.prototype.getURL = function() {
    if (_.isString(this.url)) {
      return this.url;
    } else {
      return this.url();
    }
  };

  CocoCollection.prototype.fetch = function(options) {
    if (options == null) {
      options = {};
    }
    if (this.project) {
      if (options.data == null) {
        options.data = {};
      }
      options.data.project = this.project.join(',');
    }
    this.jqxhr = CocoCollection.__super__.fetch.call(this, options);
    this.loading = true;
    return this.jqxhr;
  };

  CocoCollection.prototype.setProjection = function(project) {
    this.project = project;
  };

  CocoCollection.prototype.stringify = function() {
    return JSON.stringify(this.toJSON());
  };

  CocoCollection.prototype.wait = function(event) {
    return new Promise((function(_this) {
      return function(resolve) {
        return _this.once(event, resolve);
      };
    })(this));
  };

  return CocoCollection;

})(Backbone.Collection);
});

;require.register("collections/CodeLogs", function(exports, require, module) {
var CocoCollection, CodeLog, CodeLogCollection,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoCollection = require('collections/CocoCollection');

CodeLog = require('models/CodeLog');

module.exports = CodeLogCollection = (function(superClass) {
  extend(CodeLogCollection, superClass);

  function CodeLogCollection() {
    return CodeLogCollection.__super__.constructor.apply(this, arguments);
  }

  CodeLogCollection.prototype.url = '/db/codelogs';

  CodeLogCollection.prototype.model = CodeLog;

  return CodeLogCollection;

})(CocoCollection);
});

;require.register("collections/ComponentsCollection", function(exports, require, module) {
var CocoCollection, ComponentsCollection, LevelComponent,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

LevelComponent = require('models/LevelComponent');

CocoCollection = require('collections/CocoCollection');

module.exports = ComponentsCollection = (function(superClass) {
  extend(ComponentsCollection, superClass);

  function ComponentsCollection() {
    return ComponentsCollection.__super__.constructor.apply(this, arguments);
  }

  ComponentsCollection.prototype.url = '/db/level.component';

  ComponentsCollection.prototype.model = LevelComponent;

  return ComponentsCollection;

})(CocoCollection);
});

;require.register("collections/CourseInstances", function(exports, require, module) {
var CocoCollection, CourseInstance, CourseInstances,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CourseInstance = require('models/CourseInstance');

CocoCollection = require('collections/CocoCollection');

module.exports = CourseInstances = (function(superClass) {
  extend(CourseInstances, superClass);

  function CourseInstances() {
    return CourseInstances.__super__.constructor.apply(this, arguments);
  }

  CourseInstances.prototype.model = CourseInstance;

  CourseInstances.prototype.url = '/db/course_instance';

  CourseInstances.prototype.fetchByOwner = function(ownerID, options) {
    if (options == null) {
      options = {};
    }
    ownerID = ownerID.id || ownerID;
    if (options.data == null) {
      options.data = {};
    }
    options.data.ownerID = ownerID;
    return this.fetch(options);
  };

  CourseInstances.prototype.fetchForClassroom = function(classroomID, options) {
    if (options == null) {
      options = {};
    }
    classroomID = classroomID.id || classroomID;
    if (options.data == null) {
      options.data = {};
    }
    options.data.classroomID = classroomID;
    return this.fetch(options);
  };

  return CourseInstances;

})(CocoCollection);
});

;require.register("collections/Courses", function(exports, require, module) {
var CocoCollection, Course, Courses,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Course = require('models/Course');

CocoCollection = require('collections/CocoCollection');

module.exports = Courses = (function(superClass) {
  extend(Courses, superClass);

  function Courses() {
    return Courses.__super__.constructor.apply(this, arguments);
  }

  Courses.prototype.model = Course;

  Courses.prototype.url = '/db/course';

  Courses.prototype.fetchReleased = function(options) {
    if (options == null) {
      options = {};
    }
    if (options.data == null) {
      options.data = {};
    }
    options.data.releasePhase = 'released';
    return this.fetch(options);
  };

  return Courses;

})(CocoCollection);
});

;require.register("collections/DocumentFiles", function(exports, require, module) {
var CocoCollection, File, ModelFiles,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoCollection = require('collections/CocoCollection');

File = require('models/File');

module.exports = ModelFiles = (function(superClass) {
  extend(ModelFiles, superClass);

  ModelFiles.prototype.model = File;

  function ModelFiles(model) {
    var url;
    ModelFiles.__super__.constructor.call(this);
    url = model.constructor.prototype.urlRoot;
    url += "/" + (model.get('original') || model.id) + "/files";
    this.url = url;
  }

  return ModelFiles;

})(CocoCollection);
});

;require.register("collections/EarnedAchievementCollection", function(exports, require, module) {
var CocoCollection, EarnedAchievement, EarnedAchievementCollection,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoCollection = require('collections/CocoCollection');

EarnedAchievement = require('models/EarnedAchievement');

module.exports = EarnedAchievementCollection = (function(superClass) {
  extend(EarnedAchievementCollection, superClass);

  function EarnedAchievementCollection() {
    return EarnedAchievementCollection.__super__.constructor.apply(this, arguments);
  }

  EarnedAchievementCollection.prototype.model = EarnedAchievement;

  EarnedAchievementCollection.prototype.initialize = function(userID) {
    this.url = "/db/user/" + userID + "/achievements";
    return EarnedAchievementCollection.__super__.initialize.call(this);
  };

  return EarnedAchievementCollection;

})(CocoCollection);
});

;require.register("collections/LeaderboardCollection", function(exports, require, module) {
var CocoCollection, LeaderboardCollection, LevelSession,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoCollection = require('collections/CocoCollection');

LevelSession = require('models/LevelSession');

module.exports = LeaderboardCollection = (function(superClass) {
  extend(LeaderboardCollection, superClass);

  LeaderboardCollection.prototype.url = '';

  LeaderboardCollection.prototype.model = LevelSession;

  function LeaderboardCollection(level, options) {
    LeaderboardCollection.__super__.constructor.call(this);
    if (options == null) {
      options = {};
    }
    this.url = "/db/level/" + (level.get('original')) + "." + (level.get('version').major) + "/leaderboard?" + ($.param(options));
  }

  return LeaderboardCollection;

})(CocoCollection);
});

;require.register("collections/LevelSessions", function(exports, require, module) {
var CocoCollection, LevelSession, LevelSessionCollection,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoCollection = require('collections/CocoCollection');

LevelSession = require('models/LevelSession');

module.exports = LevelSessionCollection = (function(superClass) {
  extend(LevelSessionCollection, superClass);

  function LevelSessionCollection() {
    return LevelSessionCollection.__super__.constructor.apply(this, arguments);
  }

  LevelSessionCollection.prototype.url = '/db/level.session';

  LevelSessionCollection.prototype.model = LevelSession;

  LevelSessionCollection.prototype.fetchForCourseInstance = function(courseInstanceID, options) {
    options = _.extend({
      url: "/db/course_instance/" + courseInstanceID + "/my-course-level-sessions"
    }, options);
    return this.fetch(options);
  };

  LevelSessionCollection.prototype.fetchForClassroomMembers = function(classroomID, options) {
    options = _.extend({
      url: "/db/classroom/" + classroomID + "/member-sessions"
    }, options);
    return this.fetch(options);
  };

  LevelSessionCollection.prototype.fetchForAllClassroomMembers = function(classroom, options) {
    var jqxhrs, limit, size, skip;
    if (options == null) {
      options = {};
    }
    limit = 10;
    skip = 0;
    size = _.size(classroom.get('members'));
    if (options.data == null) {
      options.data = {};
    }
    options.data.memberLimit = limit;
    options.remove = false;
    jqxhrs = [];
    while (skip < size) {
      options = _.cloneDeep(options);
      options.data.memberSkip = skip;
      jqxhrs.push(this.fetchForClassroomMembers(classroom.id, options));
      skip += limit;
    }
    return jqxhrs;
  };

  return LevelSessionCollection;

})(CocoCollection);
});

;require.register("collections/Levels", function(exports, require, module) {
var CocoCollection, Level, LevelCollection,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoCollection = require('collections/CocoCollection');

Level = require('models/Level');

module.exports = LevelCollection = (function(superClass) {
  extend(LevelCollection, superClass);

  function LevelCollection() {
    return LevelCollection.__super__.constructor.apply(this, arguments);
  }

  LevelCollection.prototype.url = '/db/level';

  LevelCollection.prototype.model = Level;

  LevelCollection.prototype.fetchForClassroom = function(classroomID, options) {
    if (options == null) {
      options = {};
    }
    options.url = "/db/classroom/" + classroomID + "/levels";
    return this.fetch(options);
  };

  LevelCollection.prototype.fetchForClassroomAndCourse = function(classroomID, courseID, options) {
    if (options == null) {
      options = {};
    }
    options.url = "/db/classroom/" + classroomID + "/courses/" + courseID + "/levels";
    return this.fetch(options);
  };

  LevelCollection.prototype.fetchForCampaign = function(campaignSlug, options) {
    if (options == null) {
      options = {};
    }
    options.url = "/db/campaign/" + campaignSlug + "/levels";
    return this.fetch(options);
  };

  return LevelCollection;

})(CocoCollection);
});

;require.register("collections/Patches", function(exports, require, module) {
var CocoCollection, PatchModel, Patches,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PatchModel = require('models/Patch');

CocoCollection = require('collections/CocoCollection');

module.exports = Patches = (function(superClass) {
  extend(Patches, superClass);

  function Patches() {
    return Patches.__super__.constructor.apply(this, arguments);
  }

  Patches.prototype.model = PatchModel;

  Patches.prototype.fetchMineFor = function(targetModel, options) {
    if (options == null) {
      options = {};
    }
    options.url = (_.result(targetModel, 'url')) + "/patches";
    if (options.data == null) {
      options.data = {};
    }
    options.data.creator = me.id;
    return this.fetch(options);
  };

  return Patches;

})(CocoCollection);
});

;require.register("collections/PatchesCollection", function(exports, require, module) {
var CocoCollection, PatchModel, PatchesCollection,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PatchModel = require('models/Patch');

CocoCollection = require('collections/CocoCollection');

module.exports = PatchesCollection = (function(superClass) {
  extend(PatchesCollection, superClass);

  function PatchesCollection() {
    return PatchesCollection.__super__.constructor.apply(this, arguments);
  }

  PatchesCollection.prototype.model = PatchModel;

  PatchesCollection.prototype.initialize = function(models, options, forModel, status) {
    var identifier;
    this.status = status != null ? status : 'pending';
    PatchesCollection.__super__.initialize.apply(this, arguments);
    identifier = !forModel.get('original') ? '_id' : 'original';
    return this.url = forModel.urlRoot + "/" + (forModel.get(identifier)) + "/patches?status=" + this.status;
  };

  return PatchesCollection;

})(CocoCollection);
});

;require.register("collections/Payments", function(exports, require, module) {
var CocoCollection, Payment, Payments,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Payment = require('models/Payment');

CocoCollection = require('collections/CocoCollection');

module.exports = Payments = (function(superClass) {
  extend(Payments, superClass);

  function Payments() {
    return Payments.__super__.constructor.apply(this, arguments);
  }

  Payments.prototype.model = Payment;

  Payments.prototype.url = '/db/payment';

  return Payments;

})(CocoCollection);
});

;require.register("collections/Prepaids", function(exports, require, module) {
var CocoCollection, Prepaid, Prepaids, sum,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoCollection = require('collections/CocoCollection');

Prepaid = require('models/Prepaid');

sum = function(numbers) {
  return _.reduce(numbers, function(a, b) {
    return a + b;
  });
};

module.exports = Prepaids = (function(superClass) {
  extend(Prepaids, superClass);

  function Prepaids() {
    return Prepaids.__super__.constructor.apply(this, arguments);
  }

  Prepaids.prototype.model = Prepaid;

  Prepaids.prototype.url = "/db/prepaid";

  Prepaids.prototype.totalMaxRedeemers = function() {
    var prepaid;
    return sum((function() {
      var i, len, ref, results;
      ref = this.models;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        prepaid = ref[i];
        results.push(prepaid.get('maxRedeemers'));
      }
      return results;
    }).call(this)) || 0;
  };

  Prepaids.prototype.totalRedeemers = function() {
    var prepaid;
    return sum((function() {
      var i, len, ref, results;
      ref = this.models;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        prepaid = ref[i];
        results.push(_.size(prepaid.get('redeemers')));
      }
      return results;
    }).call(this)) || 0;
  };

  Prepaids.prototype.totalAvailable = function() {
    return Math.max(this.totalMaxRedeemers() - this.totalRedeemers(), 0);
  };

  Prepaids.prototype.fetchByCreator = function(creatorID, opts) {
    if (opts == null) {
      opts = {};
    }
    if (opts.data == null) {
      opts.data = {};
    }
    opts.data.creator = creatorID;
    return this.fetch(opts);
  };

  return Prepaids;

})(CocoCollection);
});

;require.register("collections/Products", function(exports, require, module) {
var CocoCollection, Product, Products,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoCollection = require('./CocoCollection');

Product = require('models/Product');

module.exports = Products = (function(superClass) {
  extend(Products, superClass);

  function Products() {
    return Products.__super__.constructor.apply(this, arguments);
  }

  Products.prototype.model = Product;

  Products.prototype.url = '/db/products';

  Products.prototype.getByName = function(name) {
    return this.findWhere({
      name: name
    });
  };

  return Products;

})(CocoCollection);
});

;require.register("collections/RecentlyPlayedCollection", function(exports, require, module) {
var CocoCollection, LevelSession, RecentlyPlayedCollection,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoCollection = require('./CocoCollection');

LevelSession = require('models/LevelSession');

module.exports = RecentlyPlayedCollection = (function(superClass) {
  extend(RecentlyPlayedCollection, superClass);

  RecentlyPlayedCollection.prototype.model = LevelSession;

  function RecentlyPlayedCollection(userID, options) {
    this.url = "/db/user/" + userID + "/recently_played";
    RecentlyPlayedCollection.__super__.constructor.call(this, options);
  }

  return RecentlyPlayedCollection;

})(CocoCollection);
});

;require.register("collections/RelatedAchievementsCollection", function(exports, require, module) {
var Achievement, CocoCollection, RelatedAchievementCollection,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoCollection = require('collections/CocoCollection');

Achievement = require('models/Achievement');

RelatedAchievementCollection = (function(superClass) {
  extend(RelatedAchievementCollection, superClass);

  function RelatedAchievementCollection() {
    return RelatedAchievementCollection.__super__.constructor.apply(this, arguments);
  }

  RelatedAchievementCollection.prototype.model = Achievement;

  RelatedAchievementCollection.prototype.initialize = function(relatedID) {
    return this.url = "/db/achievement?related=" + relatedID;
  };

  return RelatedAchievementCollection;

})(CocoCollection);

module.exports = RelatedAchievementCollection;
});

;require.register("collections/SimulatorsLeaderboardCollection", function(exports, require, module) {
var CocoCollection, SimulatorsLeaderboardCollection, User,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoCollection = require('collections/CocoCollection');

User = require('models/User');

module.exports = SimulatorsLeaderboardCollection = (function(superClass) {
  extend(SimulatorsLeaderboardCollection, superClass);

  SimulatorsLeaderboardCollection.prototype.url = '';

  SimulatorsLeaderboardCollection.prototype.model = User;

  function SimulatorsLeaderboardCollection(options) {
    SimulatorsLeaderboardCollection.__super__.constructor.call(this);
    if (options == null) {
      options = {};
    }
    this.url = "/db/user/me/simulatorLeaderboard?" + ($.param(options));
  }

  return SimulatorsLeaderboardCollection;

})(CocoCollection);
});

;require.register("collections/StripeCoupons", function(exports, require, module) {
var CocoCollection, StripeCoupon, StripeCoupons,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

StripeCoupon = require('models/StripeCoupon');

CocoCollection = require('collections/CocoCollection');

module.exports = StripeCoupons = (function(superClass) {
  extend(StripeCoupons, superClass);

  function StripeCoupons() {
    return StripeCoupons.__super__.constructor.apply(this, arguments);
  }

  StripeCoupons.prototype.model = StripeCoupon;

  StripeCoupons.prototype.url = '/stripe/coupons';

  return StripeCoupons;

})(CocoCollection);
});

;require.register("collections/ThangNamesCollection", function(exports, require, module) {
var CocoCollection, ThangNamesCollection, ThangType,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ThangType = require('models/ThangType');

CocoCollection = require('collections/CocoCollection');

module.exports = ThangNamesCollection = (function(superClass) {
  extend(ThangNamesCollection, superClass);

  ThangNamesCollection.prototype.url = '/db/thang.type/names';

  ThangNamesCollection.prototype.model = ThangType;

  ThangNamesCollection.prototype.isCachable = false;

  function ThangNamesCollection(ids) {
    this.ids = ids;
    ThangNamesCollection.__super__.constructor.call(this);
    this.ids.sort();
    if (this.ids.length > 55) {
      console.error('Too many ids, we\'ll likely go over the GET url kind-of-limit of 2000 characters.');
    }
  }

  ThangNamesCollection.prototype.fetch = function(options) {
    if (options == null) {
      options = {};
    }
    _.extend(options, {
      data: {
        ids: this.ids
      }
    });
    return ThangNamesCollection.__super__.fetch.call(this, options);
  };

  return ThangNamesCollection;

})(CocoCollection);
});

;require.register("collections/ThangTypes", function(exports, require, module) {
var CocoCollection, ThangType, ThangTypeCollection,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoCollection = require('collections/CocoCollection');

ThangType = require('models/ThangType');

module.exports = ThangTypeCollection = (function(superClass) {
  extend(ThangTypeCollection, superClass);

  function ThangTypeCollection() {
    return ThangTypeCollection.__super__.constructor.apply(this, arguments);
  }

  ThangTypeCollection.prototype.url = '/db/thang.type';

  ThangTypeCollection.prototype.model = ThangType;

  ThangTypeCollection.prototype.fetchHeroes = function() {
    return this.fetch({
      url: '/db/thang.type?view=heroes'
    });
  };

  return ThangTypeCollection;

})(CocoCollection);
});

;require.register("collections/TrialRequests", function(exports, require, module) {
var CocoCollection, TrialRequest, TrialRequestCollection,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoCollection = require('collections/CocoCollection');

TrialRequest = require('models/TrialRequest');

module.exports = TrialRequestCollection = (function(superClass) {
  extend(TrialRequestCollection, superClass);

  function TrialRequestCollection() {
    return TrialRequestCollection.__super__.constructor.apply(this, arguments);
  }

  TrialRequestCollection.prototype.url = '/db/trial.request';

  TrialRequestCollection.prototype.model = TrialRequest;

  TrialRequestCollection.prototype.fetchOwn = function(options) {
    options = _.extend({
      data: {}
    }, options);
    options.data.applicant = me.id;
    return this.fetch(options);
  };

  return TrialRequestCollection;

})(CocoCollection);
});

;require.register("collections/Users", function(exports, require, module) {
var CocoCollection, User, Users,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

User = require('models/User');

CocoCollection = require('collections/CocoCollection');

module.exports = Users = (function(superClass) {
  extend(Users, superClass);

  function Users() {
    return Users.__super__.constructor.apply(this, arguments);
  }

  Users.prototype.model = User;

  Users.prototype.url = '/db/user';

  Users.prototype.fetchForClassroom = function(classroom, options) {
    var classroomID, jqxhrs, limit, size, skip;
    if (options == null) {
      options = {};
    }
    if (options.removeDeleted) {
      delete options.removeDeleted;
      this.listenTo(this, 'sync', this.removeDeletedUsers);
    }
    classroomID = classroom.id || classroom;
    limit = 10;
    skip = 0;
    size = _.size(classroom.get('members'));
    options.url = "/db/classroom/" + classroomID + "/members";
    if (options.data == null) {
      options.data = {};
    }
    options.data.memberLimit = limit;
    options.remove = false;
    jqxhrs = [];
    while (skip < size) {
      options = _.cloneDeep(options);
      options.data.memberSkip = skip;
      jqxhrs.push(this.fetch(options));
      skip += limit;
    }
    return jqxhrs;
  };

  Users.prototype.removeDeletedUsers = function() {
    this.remove(this.filter(function(user) {
      return user.get('deleted');
    }));
    return true;
  };

  Users.prototype.search = function(term) {
    if (!term) {
      return this.slice();
    }
    term = term.toLowerCase();
    return this.filter(function(user) {
      var ref;
      return user.broadName().toLowerCase().indexOf(term) > -1 || ((ref = user.get('email')) != null ? ref : '').indexOf(term) > -1;
    });
  };

  return Users;

})(CocoCollection);
});

;require.register("core/CocoClass", function(exports, require, module) {
var CocoClass, classCount, doNothing, makeScopeName, utils;

utils = require('./../core/utils');

classCount = 0;

makeScopeName = function() {
  return "class-scope-" + (classCount++);
};

doNothing = function() {};

module.exports = CocoClass = (function() {
  CocoClass.nicks = [];

  CocoClass.nicksUsed = {};

  CocoClass.remainingNicks = [];

  CocoClass.nextNick = function() {
    var baseNick, i, nick;
    if (!this.nicks.length) {
      return (this.name || 'CocoClass') + ' ' + classCount;
    }
    this.remainingNicks = this.remainingNicks.length ? this.remainingNicks : this.nicks.slice();
    baseNick = this.remainingNicks.splice(Math.floor(Math.random() * this.remainingNicks.length), 1)[0];
    i = 0;
    while (true) {
      nick = i ? baseNick + " " + i : baseNick;
      if (!this.nicksUsed[nick]) {
        break;
      }
      i++;
    }
    this.nicksUsed[nick] = true;
    return nick;
  };

  CocoClass.prototype.subscriptions = {};

  CocoClass.prototype.shortcuts = {};

  function CocoClass() {
    this.nick = this.constructor.nextNick();
    this.subscriptions = utils.combineAncestralObject(this, 'subscriptions');
    this.shortcuts = utils.combineAncestralObject(this, 'shortcuts');
    this.listenToSubscriptions();
    this.scope = makeScopeName();
    this.listenToShortcuts();
    if (typeof Backbone !== "undefined" && Backbone !== null) {
      _.extend(this, Backbone.Events);
    }
  }

  CocoClass.prototype.destroy = function() {
    var key;
    if (typeof this.stopListening === "function") {
      this.stopListening();
    }
    if (typeof this.off === "function") {
      this.off();
    }
    this.unsubscribeAll();
    this.stopListeningToShortcuts();
    this.constructor.nicksUsed[this.nick] = false;
    for (key in this) {
      this[key] = void 0;
    }
    this.destroyed = true;
    this.off = doNothing;
    return this.destroy = doNothing;
  };

  CocoClass.prototype.listenToSubscriptions = function() {
    var channel, func, ref, results;
    if ((typeof Backbone !== "undefined" && Backbone !== null ? Backbone.Mediator : void 0) == null) {
      return;
    }
    ref = this.subscriptions;
    results = [];
    for (channel in ref) {
      func = ref[channel];
      func = utils.normalizeFunc(func, this);
      results.push(Backbone.Mediator.subscribe(channel, func, this));
    }
    return results;
  };

  CocoClass.prototype.addNewSubscription = function(channel, func) {
    if ((typeof Backbone !== "undefined" && Backbone !== null ? Backbone.Mediator : void 0) == null) {
      return;
    }
    if (this.destroyed) {
      return;
    }
    if (this.subscriptions[channel] !== void 0) {
      return;
    }
    func = utils.normalizeFunc(func, this);
    this.subscriptions[channel] = func;
    return Backbone.Mediator.subscribe(channel, func, this);
  };

  CocoClass.prototype.unsubscribeAll = function() {
    var channel, func, ref, results;
    if ((typeof Backbone !== "undefined" && Backbone !== null ? Backbone.Mediator : void 0) == null) {
      return;
    }
    ref = this.subscriptions;
    results = [];
    for (channel in ref) {
      func = ref[channel];
      func = utils.normalizeFunc(func, this);
      results.push(Backbone.Mediator.unsubscribe(channel, func, this));
    }
    return results;
  };

  CocoClass.prototype.listenToShortcuts = function() {
    var func, ref, results, shortcut;
    if (typeof key === "undefined" || key === null) {
      return;
    }
    ref = this.shortcuts;
    results = [];
    for (shortcut in ref) {
      func = ref[shortcut];
      func = utils.normalizeFunc(func, this);
      results.push(key(shortcut, this.scope, _.bind(func, this)));
    }
    return results;
  };

  CocoClass.prototype.stopListeningToShortcuts = function() {
    if (typeof key === "undefined" || key === null) {
      return;
    }
    return key.deleteScope(this.scope);
  };

  CocoClass.prototype.playSound = function(trigger, volume) {
    if (volume == null) {
      volume = 1;
    }
    return Backbone.Mediator.publish('audio-player:play-sound', {
      trigger: trigger,
      volume: volume
    });
  };

  CocoClass.prototype.wait = function(event) {
    return new Promise((function(_this) {
      return function(resolve) {
        return _this.once(event, resolve);
      };
    })(this));
  };

  return CocoClass;

})();
});

;require.register("core/ModuleLoader", function(exports, require, module) {
var CocoClass, LOG, ModuleLoader, locale,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoClass = require('core/CocoClass');

locale = require('locale/locale');

LOG = false;

module.exports = ModuleLoader = ModuleLoader = (function(superClass) {
  extend(ModuleLoader, superClass);

  ModuleLoader.WADS = ['lib', 'views/play', 'views/editor'];

  function ModuleLoader() {
    this.onFileLoad = bind(this.onFileLoad, this);
    var wrapped;
    ModuleLoader.__super__.constructor.call(this);
    this.loaded = {};
    this.queue = new createjs.LoadQueue();
    this.queue.on('fileload', this.onFileLoad, this);
    wrapped = _.wrap(window.require, function(func, name, loaderPath) {
      if (_.string.startsWith(name, 'vendor/')) {
        return {};
      }
      if (name === 'tests') {
        return {};
      }
      if (name === 'demo-app') {
        return {};
      }
      if (name === 'lib/auth') {
        name = 'core/auth';
      }
      return func(name, loaderPath);
    });
    _.extend(wrapped, window.require);
    window.require = wrapped;
    this.updateProgress = _.throttle(_.bind(this.updateProgress, this), 700);
    this.lastShownProgress = 0;
  }

  ModuleLoader.prototype.load = function(path, first) {
    var originalPath, wad;
    if (first == null) {
      first = true;
    }
    $('#module-load-progress').css('opacity', 1);
    if (first) {
      this.recentPaths = [];
      this.recentLoadedBytes = 0;
    }
    originalPath = path;
    wad = _.find(ModuleLoader.WADS, function(wad) {
      return _.string.startsWith(path, wad);
    });
    if (wad) {
      path = wad;
    }
    if (this.loaded[path]) {
      return false;
    }
    this.loaded[path] = true;
    this.recentPaths.push(path);
    if (LOG) {
      console.debug('Loading js file:', "/javascripts/app/" + path + ".js");
    }
    this.queue.loadFile({
      id: path,
      src: "/javascripts/app/" + path + ".js",
      type: createjs.LoadQueue.JAVASCRIPT
    });
    return true;
  };

  ModuleLoader.prototype.loadLanguage = function(langCode) {
    var firstBit, loading;
    if (langCode == null) {
      langCode = 'en-US';
    }
    loading = this.load("locale/" + langCode);
    firstBit = langCode.slice(0, 2);
    if (firstBit === langCode) {
      return loading;
    }
    if (locale[firstBit] == null) {
      return loading;
    }
    return this.load("locale/" + firstBit, false) || loading;
  };

  ModuleLoader.prototype.onFileLoad = function(e) {
    var dependencies, have, haveWithIndexRemoved, i, len, missing, module, treemaExt;
    if (!_.string.startsWith(e.item.id, 'vendor')) {
      have = window.require.list();
      haveWithIndexRemoved = _(have).filter(function(file) {
        return _.string.endsWith(file, 'index');
      }).map(function(file) {
        return file.slice(0, -6);
      }).value();
      have = have.concat(haveWithIndexRemoved);
      if (LOG) {
        console.group('Dependencies', e.item.id);
      }
      this.recentLoadedBytes += e.rawResult.length;
      dependencies = this.parseDependencies(e.rawResult);
      if (LOG) {
        console.groupEnd();
      }
      missing = _.difference(dependencies, have);
      for (i = 0, len = missing.length; i < len; i++) {
        module = missing[i];
        this.load(module, false);
      }
    }
    if (_.string.startsWith(e.item.id, 'locale')) {
      locale.update();
    }
    $(e.result).remove();
    if (e.item.id === 'vendor/treema') {
      treemaExt = require('core/treema-ext');
      treemaExt.setup();
    }
    if (this.queue.progress === 1) {
      this.recentPaths.sort();
      this.trigger('load-complete');
    }
    this.trigger('loaded', e.item);
    return this.updateProgress();
  };

  ModuleLoader.prototype.updateProgress = function() {
    if (this.queue.progress < this.lastShownProgress) {
      return;
    }
    $('#module-load-progress .progress-bar').css('width', (100 * this.queue.progress) + '%');
    if (this.queue.progress === 1) {
      return $('#module-load-progress').css('opacity', 0);
    }
  };

  ModuleLoader.prototype.parseDependencies = function(raw) {
    var bit, bits, dep, dependencies, i, len, root, rootFolder;
    bits = raw.match(/(require\(['"](.+?)['"])|(register\(['"].+?['"])/g) || [];
    rootFolder = null;
    dependencies = [];
    for (i = 0, len = bits.length; i < len; i++) {
      bit = bits[i];
      if (_.string.startsWith(bit, 'register')) {
        root = bit.slice(10, bit.length - 1);
        if (LOG) {
          if (rootFolder) {
            console.groupEnd();
          }
        }
        rootFolder = (root.match('.+/')[0] || '').slice(0, -1);
        if (LOG) {
          console.group('register', rootFolder, "(" + bit + ")");
        }
      } else {
        dep = bit.slice(9, bit.length - 1);
        if (dep[0] === '/') {
          dep = dep.slice(1);
        }
        dep = this.expand(rootFolder, dep);
        if (dep === 'memwatch') {
          continue;
        }
        if (_.string.startsWith(dep, 'ace/')) {
          continue;
        }
        dependencies.push(dep);
        if (LOG) {
          console.debug(dep);
        }
      }
    }
    if (LOG) {
      console.groupEnd();
    }
    return dependencies;
  };

  ModuleLoader.prototype.expand = function(root, name) {
    var i, len, part, parts, results;
    results = [];
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (i = 0, len = parts.length; i < len; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  return ModuleLoader;

})(CocoClass);
});

;require.register("core/NameLoader", function(exports, require, module) {
var CocoClass, NameLoader, namesCache,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoClass = require('core/CocoClass');

namesCache = {};

NameLoader = (function(superClass) {
  extend(NameLoader, superClass);

  function NameLoader() {
    this.loadedNames = bind(this.loadedNames, this);
    return NameLoader.__super__.constructor.apply(this, arguments);
  }

  NameLoader.prototype.loadNames = function(ids) {
    var id, jqxhrOptions, toLoad;
    toLoad = _.uniq((function() {
      var i, len, results;
      results = [];
      for (i = 0, len = ids.length; i < len; i++) {
        id = ids[i];
        if (!namesCache[id]) {
          results.push(id);
        }
      }
      return results;
    })());
    if (!toLoad.length) {
      return false;
    }
    jqxhrOptions = {
      url: '/db/user/x/names',
      type: 'POST',
      data: {
        ids: toLoad
      },
      success: this.loadedNames
    };
    return jqxhrOptions;
  };

  NameLoader.prototype.loadedNames = function(newNames) {
    return _.extend(namesCache, newNames);
  };

  NameLoader.prototype.getName = function(id) {
    var ref, ref1, ref2, ref3, ref4, ref5;
    if (((ref = namesCache[id]) != null ? ref.firstName : void 0) && ((ref1 = namesCache[id]) != null ? ref1.lastName : void 0)) {
      return ((ref2 = namesCache[id]) != null ? ref2.firstName : void 0) + " " + ((ref3 = namesCache[id]) != null ? ref3.lastName : void 0);
    }
    return ((ref4 = namesCache[id]) != null ? ref4.firstName : void 0) || ((ref5 = namesCache[id]) != null ? ref5.name : void 0) || id;
  };

  return NameLoader;

})(CocoClass);

module.exports = new NameLoader();
});

;require.register("core/ParticleMan", function(exports, require, module) {
var CocoClass, ParticleMan, defaults, ext, hsl, particleKinds, utils, vec,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoClass = require('core/CocoClass');

utils = require('core/utils');

module.exports = ParticleMan = ParticleMan = (function(superClass) {
  extend(ParticleMan, superClass);

  function ParticleMan() {
    this.render = bind(this.render, this);
    var err, error;
    if (!Modernizr.webgl) {
      return this.unsupported = true;
    }
    try {
      this.renderer = new THREE.WebGLRenderer({
        alpha: true
      });
    } catch (error) {
      err = error;
      return this.unsupported = true;
    }
    $(this.renderer.domElement).addClass('particle-man');
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.particleGroups = [];
  }

  ParticleMan.prototype.destroy = function() {
    var child, i, len, ref, ref1, ref2;
    this.detach();
    this.disposeObject3D(this.scene);
    ref2 = ((ref = this.scene) != null ? (ref1 = ref.children) != null ? ref1.slice() : void 0 : void 0) || [];
    for (i = 0, len = ref2.length; i < len; i++) {
      child = ref2[i];
      this.scene.remove(child);
    }
    return ParticleMan.__super__.destroy.call(this);
  };

  ParticleMan.prototype.disposeObject3D = function(obj) {
    var child, i, j, len, len1, material, ref, ref1, ref2, ref3;
    if (!obj) {
      return;
    }
    ref = obj.children;
    for (i = 0, len = ref.length; i < len; i++) {
      child = ref[i];
      this.disposeObject3D(child);
    }
    if ((ref1 = obj.geometry) != null) {
      ref1.dispose();
    }
    obj.geometry = void 0;
    if (obj.material) {
      ref3 = (ref2 = obj.material.materials) != null ? ref2 : [];
      for (j = 0, len1 = ref3.length; j < len1; j++) {
        material = ref3[j];
        material.dispose();
      }
      obj.material.dispose();
      obj.material = void 0;
    }
    if (obj.texture) {
      obj.texture.dispose();
      return obj.texture = void 0;
    }
  };

  ParticleMan.prototype.attach = function($el) {
    var camera, height, width;
    this.$el = $el;
    if (this.unsupported) {
      return;
    }
    width = this.$el.innerWidth();
    height = this.$el.innerHeight();
    this.aspectRatio = width / height;
    this.renderer.setSize(width, height);
    this.$el.append(this.renderer.domElement);
    this.camera = camera = new THREE.OrthographicCamera(100 * -0.5, 100 * 0.5, 100 * 0.5 * this.aspectRatio, 100 * -0.5 * this.aspectRatio, 0, 1000);
    this.camera.position.set(0, 0, 100);
    this.camera.up = new THREE.Vector3(0, 1, 0);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    if (!this.started) {
      this.started = true;
      return this.render();
    }
  };

  ParticleMan.prototype.detach = function() {
    if (this.unsupported) {
      return;
    }
    this.renderer.domElement.remove();
    return this.started = false;
  };

  ParticleMan.prototype.render = function() {
    var dt, group, i, len, ref;
    if (this.unsupported) {
      return;
    }
    if (this.destroyed) {
      return;
    }
    if (!this.started) {
      return;
    }
    this.renderer.render(this.scene, this.camera);
    dt = this.clock.getDelta();
    ref = this.particleGroups;
    for (i = 0, len = ref.length; i < len; i++) {
      group = ref[i];
      group.tick(dt);
    }
    return requestAnimationFrame(this.render);
  };

  ParticleMan.prototype.countFPS = function() {
    var now;
    if (this.framesRendered == null) {
      this.framesRendered = 0;
    }
    ++this.framesRendered;
    if (this.lastFPS == null) {
      this.lastFPS = new Date();
    }
    now = new Date();
    if (now - this.lastFPS > 1000) {
      console.log(this.framesRendered, 'fps with', this.particleGroups.length, 'particle groups.');
      this.framesRendered = 0;
      return this.lastFPS = now;
    }
  };

  ParticleMan.prototype.addEmitter = function(x, y, kind) {
    var aspectRatio, emitter, group, options, scale;
    if (kind == null) {
      kind = "level-dungeon-premium";
    }
    if (this.unsupported) {
      return;
    }
    options = $.extend(true, {}, particleKinds[kind]);
    if (!options.group) {
      return console.error("Couldn't find particle configuration for", kind);
    }
    options.group.texture = THREE.ImageUtils.loadTexture("/images/common/particles/" + options.group.texture + ".png");
    scale = 100;
    aspectRatio = this.$el;
    group = new SPE.Group(options.group);
    group.mesh.position.x = scale * (-0.5 + x);
    group.mesh.position.y = scale * (-0.5 + y) * this.aspectRatio;
    emitter = new SPE.Emitter(options.emitter);
    group.addEmitter(emitter);
    this.particleGroups.push(group);
    this.scene.add(group.mesh);
    return group;
  };

  ParticleMan.prototype.removeEmitter = function(group) {
    if (this.unsupported) {
      return;
    }
    this.scene.remove(group.mesh);
    return this.particleGroups = _.without(this.particleGroups, group);
  };

  ParticleMan.prototype.removeEmitters = function() {
    var group, i, len, ref, results;
    if (this.unsupported) {
      return;
    }
    ref = this.particleGroups.slice();
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      group = ref[i];
      results.push(this.removeEmitter(group));
    }
    return results;
  };

  return ParticleMan;

})(CocoClass);

hsl = function(hue, saturation, lightness) {
  return new THREE.Color(utils.hslToHex([hue, saturation, lightness]));
};

vec = function(x, y, z) {
  return new THREE.Vector3(x, y, z);
};

defaults = {
  group: {
    texture: 'star',
    maxAge: 1.9,
    radius: 0.75,
    hasPerspective: 1,
    colorize: 1,
    transparent: 1,
    alphaTest: 0.5,
    depthWrite: false,
    depthTest: true,
    blending: THREE.NormalBlending
  },
  emitter: {
    type: "disk",
    particleCount: 100,
    radius: 1,
    position: vec(0, 0, 0),
    positionSpread: vec(1, 0, 1),
    acceleration: vec(0, 2, 0),
    accelerationSpread: vec(0, 0, 0),
    velocity: vec(0, 4, 0),
    velocitySpread: vec(2, 2, 2),
    sizeStart: 6,
    sizeStartSpread: 1,
    sizeMiddle: 4,
    sizeMiddleSpread: 1,
    sizeEnd: 2,
    sizeEndSpread: 1,
    angleStart: 0,
    angleStartSpread: 0,
    angleMiddle: 0,
    angleMiddleSpread: 0,
    angleEnd: 0,
    angleEndSpread: 0,
    angleAlignVelocity: false,
    colorStart: hsl(0.55, 0.75, 0.75),
    colorStartSpread: vec(0.3, 0.3, 0.3),
    colorMiddle: hsl(0.55, 0.6, 0.5),
    colorMiddleSpread: vec(0.2, 0.2, 0.2),
    colorEnd: hsl(0.55, 0.5, 0.25),
    colorEndSpread: vec(0.1, 0.1, 0.1),
    opacityStart: 1,
    opacityStartSpread: 0,
    opacityMiddle: 0.75,
    opacityMiddleSpread: 0,
    opacityEnd: 0.25,
    opacityEndSpread: 0,
    duration: null,
    alive: 1,
    isStatic: 0
  }
};

ext = function(d, options) {
  return $.extend(true, {}, d, options != null ? options : {});
};

particleKinds = {
  'level-dungeon-premium': ext(defaults),
  'level-forest-premium': ext(defaults, {
    emitter: {
      colorStart: hsl(0.56, 0.97, 0.5),
      colorMiddle: hsl(0.56, 0.57, 0.5),
      colorEnd: hsl(0.56, 0.17, 0.5)
    }
  }),
  'level-desert-premium': ext(defaults, {
    emitter: {
      colorStart: hsl(0.56, 0.97, 0.5),
      colorMiddle: hsl(0.56, 0.57, 0.5),
      colorEnd: hsl(0.56, 0.17, 0.5)
    }
  }),
  'level-mountain-premium': ext(defaults, {
    emitter: {
      colorStart: hsl(0.56, 0.97, 0.5),
      colorMiddle: hsl(0.56, 0.57, 0.5),
      colorEnd: hsl(0.56, 0.17, 0.5)
    }
  }),
  'level-glacier-premium': ext(defaults, {
    emitter: {
      colorStart: hsl(0.56, 0.97, 0.5),
      colorMiddle: hsl(0.56, 0.57, 0.5),
      colorEnd: hsl(0.56, 0.17, 0.5)
    }
  }),
  'level-volcano-premium': ext(defaults, {
    emitter: {
      colorStart: hsl(0.56, 0.97, 0.5),
      colorMiddle: hsl(0.56, 0.57, 0.5),
      colorEnd: hsl(0.56, 0.17, 0.5)
    }
  })
};

particleKinds['level-dungeon-premium-hero'] = ext(particleKinds['level-dungeon-premium'], {
  emitter: {
    particleCount: 200,
    radius: 1.5,
    acceleration: vec(0, 4, 0),
    opacityStart: 0.25,
    opacityMiddle: 0.5,
    opacityEnd: 0.75
  }
});

particleKinds['level-dungeon-gate'] = ext(particleKinds['level-dungeon-premium'], {
  emitter: {
    particleCount: 2000,
    acceleration: vec(0, 8, 0),
    colorStart: hsl(0.5, 0.75, 0.9),
    colorMiddle: hsl(0.5, 0.75, 0.7),
    colorEnd: hsl(0.5, 0.75, 0.3),
    colorStartSpread: vec(1, 1, 1),
    colorMiddleSpread: vec(1.5, 1.5, 1.5),
    colorEndSpread: vec(2.5, 2.5, 2.5)
  }
});

particleKinds['level-dungeon-hero-ladder'] = particleKinds['level-dungeon-course-ladder'] = ext(particleKinds['level-dungeon-premium'], {
  emitter: {
    particleCount: 200,
    acceleration: vec(0, 3, 0),
    colorStart: hsl(0, 0.75, 0.7),
    colorMiddle: hsl(0, 0.75, 0.5),
    colorEnd: hsl(0, 0.75, 0.3)
  }
});

particleKinds['level-dungeon-replayable'] = particleKinds['level-dungeon-replayable-premium'] = ext(particleKinds['level-dungeon-hero-ladder'], {
  emitter: {
    colorStart: hsl(0.17, 0.75, 0.7),
    colorMiddle: hsl(0.17, 0.75, 0.5),
    colorEnd: hsl(0.17, 0.75, 0.3)
  }
});

particleKinds['level-dungeon-game-dev'] = particleKinds['level-dungeon-game-dev-premium'] = ext(particleKinds['level-dungeon-hero-ladder'], {
  emitter: {
    colorStart: hsl(0.7, 0.75, 0.7),
    colorMiddle: hsl(0.7, 0.75, 0.5),
    colorEnd: hsl(0.7, 0.75, 0.3)
  }
});

particleKinds['level-dungeon-web-dev'] = particleKinds['level-dungeon-web-dev-premium'] = ext(particleKinds['level-dungeon-hero-ladder'], {
  emitter: {
    colorStart: hsl(0.7, 0.25, 0.7),
    colorMiddle: hsl(0.7, 0.25, 0.5),
    colorEnd: hsl(0.7, 0.25, 0.3)
  }
});

particleKinds['level-dungeon-premium-item'] = ext(particleKinds['level-dungeon-gate'], {
  emitter: {
    particleCount: 2000,
    radius: 2.5,
    acceleration: vec(0, 8, 1),
    opacityStart: 0,
    opacityMiddle: 0.5,
    opacityEnd: 0.75,
    colorStart: hsl(0.5, 0.75, 0.9),
    colorMiddle: hsl(0.5, 0.75, 0.7),
    colorEnd: hsl(0.5, 0.75, 0.3),
    colorStartSpread: vec(1, 1, 1),
    colorMiddleSpread: vec(1.5, 1.5, 1.5),
    colorEndSpread: vec(2.5, 2.5, 2.5)
  }
});

particleKinds['level-forest-premium-hero'] = ext(particleKinds['level-forest-premium'], {
  emitter: {
    particleCount: 200,
    radius: 1.5,
    acceleration: vec(0, 4, 0),
    opacityStart: 0.25,
    opacityMiddle: 0.5,
    opacityEnd: 0.75
  }
});

particleKinds['level-forest-gate'] = ext(particleKinds['level-forest-premium'], {
  emitter: {
    particleCount: 120,
    velocity: vec(0, 8, 0),
    colorStart: hsl(0.56, 0.97, 0.3),
    colorMiddle: hsl(0.56, 0.57, 0.3),
    colorEnd: hsl(0.56, 0.17, 0.3),
    colorStartSpread: vec(1, 1, 1),
    colorMiddleSpread: vec(1.5, 1.5, 1.5),
    colorEndSpread: vec(2.5, 2.5, 2.5)
  }
});

particleKinds['level-forest-hero-ladder'] = particleKinds['level-forest-course-ladder'] = ext(particleKinds['level-forest-premium'], {
  emitter: {
    particleCount: 90,
    velocity: vec(0, 4, 0),
    colorStart: hsl(0, 0.95, 0.3),
    colorMiddle: hsl(0, 1, 0.5),
    colorEnd: hsl(0, 0.75, 0.1)
  }
});

particleKinds['level-forest-replayable'] = particleKinds['level-forest-replayable-premium'] = ext(particleKinds['level-forest-hero-ladder'], {
  emitter: {
    colorStart: hsl(0.17, 0.75, 0.7),
    colorMiddle: hsl(0.17, 0.75, 0.5),
    colorEnd: hsl(0.17, 0.75, 0.3)
  }
});

particleKinds['level-forest-game-dev'] = particleKinds['level-forest-game-dev-premium'] = ext(particleKinds['level-forest-hero-ladder'], {
  emitter: {
    colorStart: hsl(0.7, 0.75, 0.7),
    colorMiddle: hsl(0.7, 0.75, 0.5),
    colorEnd: hsl(0.7, 0.75, 0.3)
  }
});

particleKinds['level-forest-web-dev'] = particleKinds['level-forest-web-dev-premium'] = ext(particleKinds['level-forest-hero-ladder'], {
  emitter: {
    colorStart: hsl(0.7, 0.25, 0.7),
    colorMiddle: hsl(0.7, 0.25, 0.5),
    colorEnd: hsl(0.7, 0.25, 0.3)
  }
});

particleKinds['level-forest-premium-item'] = ext(particleKinds['level-forest-gate'], {
  emitter: {
    particleCount: 2000,
    radius: 2.5,
    acceleration: vec(0, 8, 1),
    opacityStart: 0,
    opacityMiddle: 0.5,
    opacityEnd: 0.75,
    colorStart: hsl(0.5, 0.75, 0.9),
    colorMiddle: hsl(0.5, 0.75, 0.7),
    colorEnd: hsl(0.5, 0.75, 0.3),
    colorStartSpread: vec(1, 1, 1),
    colorMiddleSpread: vec(1.5, 1.5, 1.5),
    colorEndSpread: vec(2.5, 2.5, 2.5)
  }
});

particleKinds['level-desert-premium-hero'] = ext(particleKinds['level-desert-premium'], {
  emitter: {
    particleCount: 200,
    radius: 1.5,
    acceleration: vec(0, 4, 0),
    opacityStart: 0.25,
    opacityMiddle: 0.5,
    opacityEnd: 0.75
  }
});

particleKinds['level-desert-gate'] = ext(particleKinds['level-desert-premium'], {
  emitter: {
    particleCount: 120,
    velocity: vec(0, 8, 0),
    colorStart: hsl(0.56, 0.97, 0.3),
    colorMiddle: hsl(0.56, 0.57, 0.3),
    colorEnd: hsl(0.56, 0.17, 0.3),
    colorStartSpread: vec(1, 1, 1),
    colorMiddleSpread: vec(1.5, 1.5, 1.5),
    colorEndSpread: vec(2.5, 2.5, 2.5)
  }
});

particleKinds['level-desert-hero-ladder'] = particleKinds['level-desert-course-ladder'] = ext(particleKinds['level-desert-premium'], {
  emitter: {
    particleCount: 90,
    velocity: vec(0, 4, 0),
    colorStart: hsl(0, 0.95, 0.3),
    colorMiddle: hsl(0, 1, 0.5),
    colorEnd: hsl(0, 0.75, 0.1)
  }
});

particleKinds['level-desert-replayable'] = particleKinds['level-desert-replayable-premium'] = ext(particleKinds['level-desert-hero-ladder'], {
  emitter: {
    colorStart: hsl(0.17, 0.75, 0.7),
    colorMiddle: hsl(0.17, 0.75, 0.5),
    colorEnd: hsl(0.17, 0.75, 0.3)
  }
});

particleKinds['level-desert-game-dev'] = particleKinds['level-desert-game-dev-premium'] = ext(particleKinds['level-desert-hero-ladder'], {
  emitter: {
    colorStart: hsl(0.7, 0.75, 0.7),
    colorMiddle: hsl(0.7, 0.75, 0.5),
    colorEnd: hsl(0.7, 0.75, 0.3)
  }
});

particleKinds['level-desert-web-dev'] = particleKinds['level-desert-web-dev-premium'] = ext(particleKinds['level-desert-hero-ladder'], {
  emitter: {
    colorStart: hsl(0.7, 0.25, 0.7),
    colorMiddle: hsl(0.7, 0.25, 0.5),
    colorEnd: hsl(0.7, 0.25, 0.3)
  }
});

particleKinds['level-mountain-premium-hero'] = ext(particleKinds['level-mountain-premium'], {
  emitter: {
    particleCount: 200,
    radius: 1.5,
    acceleration: vec(0, 4, 0),
    opacityStart: 0.25,
    opacityMiddle: 0.5,
    opacityEnd: 0.75
  }
});

particleKinds['level-mountain-gate'] = ext(particleKinds['level-mountain-premium'], {
  emitter: {
    particleCount: 120,
    velocity: vec(0, 8, 0),
    colorStart: hsl(0.56, 0.97, 0.3),
    colorMiddle: hsl(0.56, 0.57, 0.3),
    colorEnd: hsl(0.56, 0.17, 0.3),
    colorStartSpread: vec(1, 1, 1),
    colorMiddleSpread: vec(1.5, 1.5, 1.5),
    colorEndSpread: vec(2.5, 2.5, 2.5)
  }
});

particleKinds['level-mountain-hero-ladder'] = particleKinds['level-mountain-course-ladder'] = ext(particleKinds['level-mountain-premium'], {
  emitter: {
    particleCount: 90,
    velocity: vec(0, 4, 0),
    colorStart: hsl(0, 0.95, 0.3),
    colorMiddle: hsl(0, 1, 0.5),
    colorEnd: hsl(0, 0.75, 0.1)
  }
});

particleKinds['level-mountain-replayable'] = particleKinds['level-mountain-replayable-premium'] = ext(particleKinds['level-mountain-hero-ladder'], {
  emitter: {
    colorStart: hsl(0.17, 0.75, 0.7),
    colorMiddle: hsl(0.17, 0.75, 0.5),
    colorEnd: hsl(0.17, 0.75, 0.3)
  }
});

particleKinds['level-mountain-game-dev'] = particleKinds['level-mountain-game-dev-premium'] = ext(particleKinds['level-mountain-hero-ladder'], {
  emitter: {
    colorStart: hsl(0.7, 0.75, 0.7),
    colorMiddle: hsl(0.7, 0.75, 0.5),
    colorEnd: hsl(0.7, 0.75, 0.3)
  }
});

particleKinds['level-mountain-web-dev'] = particleKinds['level-mountain-web-dev-premium'] = ext(particleKinds['level-mountain-hero-ladder'], {
  emitter: {
    colorStart: hsl(0.7, 0.25, 0.7),
    colorMiddle: hsl(0.7, 0.25, 0.5),
    colorEnd: hsl(0.7, 0.25, 0.3)
  }
});

particleKinds['level-glacier-premium-hero'] = ext(particleKinds['level-glacier-premium'], {
  emitter: {
    particleCount: 200,
    radius: 1.5,
    acceleration: vec(0, 4, 0),
    opacityStart: 0.25,
    opacityMiddle: 0.5,
    opacityEnd: 0.75
  }
});

particleKinds['level-glacier-gate'] = ext(particleKinds['level-glacier-premium'], {
  emitter: {
    particleCount: 120,
    velocity: vec(0, 8, 0),
    colorStart: hsl(0.56, 0.97, 0.3),
    colorMiddle: hsl(0.56, 0.57, 0.3),
    colorEnd: hsl(0.56, 0.17, 0.3),
    colorStartSpread: vec(1, 1, 1),
    colorMiddleSpread: vec(1.5, 1.5, 1.5),
    colorEndSpread: vec(2.5, 2.5, 2.5)
  }
});

particleKinds['level-glacier-hero-ladder'] = particleKinds['level-glacier-course-ladder'] = ext(particleKinds['level-glacier-premium'], {
  emitter: {
    particleCount: 90,
    velocity: vec(0, 4, 0),
    colorStart: hsl(0, 0.95, 0.3),
    colorMiddle: hsl(0, 1, 0.5),
    colorEnd: hsl(0, 0.75, 0.1)
  }
});

particleKinds['level-glacier-replayable'] = particleKinds['level-glacier-replayable-premium'] = ext(particleKinds['level-glacier-hero-ladder'], {
  emitter: {
    colorStart: hsl(0.17, 0.75, 0.7),
    colorMiddle: hsl(0.17, 0.75, 0.5),
    colorEnd: hsl(0.17, 0.75, 0.3)
  }
});

particleKinds['level-glacier-game-dev'] = particleKinds['level-glacier-game-dev-premium'] = ext(particleKinds['level-glacier-hero-ladder'], {
  emitter: {
    colorStart: hsl(0.7, 0.75, 0.7),
    colorMiddle: hsl(0.7, 0.75, 0.5),
    colorEnd: hsl(0.7, 0.75, 0.3)
  }
});

particleKinds['level-glacier-web-dev'] = particleKinds['level-glacier-web-dev-premium'] = ext(particleKinds['level-glacier-hero-ladder'], {
  emitter: {
    colorStart: hsl(0.7, 0.25, 0.7),
    colorMiddle: hsl(0.7, 0.25, 0.5),
    colorEnd: hsl(0.7, 0.25, 0.3)
  }
});

particleKinds['level-volcano-premium-hero'] = ext(particleKinds['level-volcano-premium'], {
  emitter: {
    particleCount: 200,
    radius: 1.5,
    acceleration: vec(0, 4, 0),
    opacityStart: 0.25,
    opacityMiddle: 0.5,
    opacityEnd: 0.75
  }
});

particleKinds['level-volcano-gate'] = ext(particleKinds['level-volcano-premium'], {
  emitter: {
    particleCount: 120,
    velocity: vec(0, 8, 0),
    colorStart: hsl(0.56, 0.97, 0.3),
    colorMiddle: hsl(0.56, 0.57, 0.3),
    colorEnd: hsl(0.56, 0.17, 0.3),
    colorStartSpread: vec(1, 1, 1),
    colorMiddleSpread: vec(1.5, 1.5, 1.5),
    colorEndSpread: vec(2.5, 2.5, 2.5)
  }
});

particleKinds['level-volcano-hero-ladder'] = ext(particleKinds['level-volcano-premium'], {
  emitter: {
    particleCount: 90,
    velocity: vec(0, 4, 0),
    colorStart: hsl(0, 0.95, 0.3),
    colorMiddle: hsl(0, 1, 0.5),
    colorEnd: hsl(0, 0.75, 0.1)
  }
});

particleKinds['level-volcano-replayable'] = particleKinds['level-volcano-replayable-premium'] = ext(particleKinds['level-volcano-hero-ladder'], {
  emitter: {
    colorStart: hsl(0.17, 0.75, 0.7),
    colorMiddle: hsl(0.17, 0.75, 0.5),
    colorEnd: hsl(0.17, 0.75, 0.3)
  }
});

particleKinds['level-volcano-game-dev'] = particleKinds['level-volcano-game-dev-premium'] = ext(particleKinds['level-volcano-hero-ladder'], {
  emitter: {
    colorStart: hsl(0.7, 0.75, 0.7),
    colorMiddle: hsl(0.7, 0.75, 0.5),
    colorEnd: hsl(0.7, 0.75, 0.3)
  }
});

particleKinds['level-volcano-web-dev'] = particleKinds['level-volcano-web-dev-premium'] = ext(particleKinds['level-volcano-hero-ladder'], {
  emitter: {
    colorStart: hsl(0.7, 0.25, 0.7),
    colorMiddle: hsl(0.7, 0.25, 0.5),
    colorEnd: hsl(0.7, 0.25, 0.3)
  }
});
});

;require.register("core/Router", function(exports, require, module) {
var CocoRouter, go, redirect, utils,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

go = function(path, options) {
  return function() {
    return this.routeDirectly(path, arguments, options);
  };
};

redirect = function(path) {
  return function() {
    return this.navigate(path + document.location.search, {
      trigger: true,
      replace: true
    });
  };
};

utils = require('./utils');

module.exports = CocoRouter = (function(superClass) {
  extend(CocoRouter, superClass);

  function CocoRouter() {
    this.renderSocialButtons = bind(this.renderSocialButtons, this);
    return CocoRouter.__super__.constructor.apply(this, arguments);
  }

  CocoRouter.prototype.initialize = function() {
    this.bind('route', this._trackPageView);
    Backbone.Mediator.subscribe('router:navigate', this.onNavigate, this);
    return this.initializeSocialMediaServices = _.once(this.initializeSocialMediaServices);
  };

  CocoRouter.prototype.routes = {
    '': function() {
      if (window.serverConfig.picoCTF) {
        return this.routeDirectly('play/CampaignView', ['picoctf'], {});
      }
      if (utils.getQueryVariable('hour_of_code')) {
        return this.navigate("/play?hour_of_code=true", {
          trigger: true,
          replace: true
        });
      }
      return this.routeDirectly('HomeView', []);
    },
    'about': go('AboutView'),
    'account': go('account/MainAccountView'),
    'account/settings': go('account/AccountSettingsRootView'),
    'account/unsubscribe': go('account/UnsubscribeView'),
    'account/payments': go('account/PaymentsView'),
    'account/subscription': go('account/SubscriptionView'),
    'account/invoices': go('account/InvoicesView'),
    'account/prepaid': go('account/PrepaidView'),
    'admin': go('admin/MainAdminView'),
    'admin/clas': go('admin/CLAsView'),
    'admin/classroom-content': go('admin/AdminClassroomContentView'),
    'admin/classroom-levels': go('admin/AdminClassroomLevelsView'),
    'admin/design-elements': go('admin/DesignElementsView'),
    'admin/files': go('admin/FilesView'),
    'admin/analytics': go('admin/AnalyticsView'),
    'admin/analytics/subscriptions': go('admin/AnalyticsSubscriptionsView'),
    'admin/level-sessions': go('admin/LevelSessionsView'),
    'admin/school-counts': go('admin/SchoolCountsView'),
    'admin/school-licenses': go('admin/SchoolLicensesView'),
    'admin/users': go('admin/UsersView'),
    'admin/base': go('admin/BaseView'),
    'admin/demo-requests': go('admin/DemoRequestsView'),
    'admin/trial-requests': go('admin/TrialRequestsView'),
    'admin/user-code-problems': go('admin/UserCodeProblemsView'),
    'admin/pending-patches': go('admin/PendingPatchesView'),
    'admin/codelogs': go('admin/CodeLogsView'),
    'artisans': go('artisans/ArtisansView'),
    'artisans/level-tasks': go('artisans/LevelTasksView'),
    'artisans/solution-problems': go('artisans/SolutionProblemsView'),
    'artisans/thang-tasks': go('artisans/ThangTasksView'),
    'artisans/level-concepts': go('artisans/LevelConceptMap'),
    'artisans/level-guides': go('artisans/LevelGuidesView'),
    'careers': function() {
      return window.location.href = 'https://jobs.lever.co/codecombat';
    },
    'Careers': function() {
      return window.location.href = 'https://jobs.lever.co/codecombat';
    },
    'cla': go('CLAView'),
    'clans': go('clans/ClansView'),
    'clans/:clanID': go('clans/ClanDetailsView'),
    'community': go('CommunityView'),
    'contribute': go('contribute/MainContributeView'),
    'contribute/adventurer': go('contribute/AdventurerView'),
    'contribute/ambassador': go('contribute/AmbassadorView'),
    'contribute/archmage': go('contribute/ArchmageView'),
    'contribute/artisan': go('contribute/ArtisanView'),
    'contribute/diplomat': go('contribute/DiplomatView'),
    'contribute/scribe': go('contribute/ScribeView'),
    'courses': redirect('/students'),
    'Courses': redirect('/students'),
    'courses/students': redirect('/students'),
    'courses/teachers': redirect('/teachers/classes'),
    'courses/purchase': redirect('/teachers/licenses'),
    'courses/enroll(/:courseID)': redirect('/teachers/licenses'),
    'courses/update-account': redirect('students/update-account'),
    'courses/:classroomID': function() {
      return this.navigate("/students/" + arguments[0], {
        trigger: true,
        replace: true
      });
    },
    'courses/:courseID/:courseInstanceID': function() {
      return this.navigate("/students/" + arguments[0] + "/" + arguments[1], {
        trigger: true,
        replace: true
      });
    },
    'db/*path': 'routeToServer',
    'demo(/*subpath)': go('DemoView'),
    'docs/components': go('docs/ComponentsDocumentationView'),
    'docs/systems': go('docs/SystemsDocumentationView'),
    'editor': go('CommunityView'),
    'editor/achievement': go('editor/achievement/AchievementSearchView'),
    'editor/achievement/:articleID': go('editor/achievement/AchievementEditView'),
    'editor/article': go('editor/article/ArticleSearchView'),
    'editor/article/preview': go('editor/article/ArticlePreviewView'),
    'editor/article/:articleID': go('editor/article/ArticleEditView'),
    'editor/level': go('editor/level/LevelSearchView'),
    'editor/level/:levelID': go('editor/level/LevelEditView'),
    'editor/thang': go('editor/thang/ThangTypeSearchView'),
    'editor/thang/:thangID': go('editor/thang/ThangTypeEditView'),
    'editor/campaign/:campaignID': go('editor/campaign/CampaignEditorView'),
    'editor/poll': go('editor/poll/PollSearchView'),
    'editor/poll/:articleID': go('editor/poll/PollEditView'),
    'editor/thang-tasks': go('editor/ThangTasksView'),
    'editor/verifier': go('editor/verifier/VerifierView'),
    'editor/verifier/:levelID': go('editor/verifier/VerifierView'),
    'editor/course': go('editor/course/CourseSearchView'),
    'editor/course/:courseID': go('editor/course/CourseEditView'),
    'file/*path': 'routeToServer',
    'github/*path': 'routeToServer',
    'hoc': function() {
      return this.navigate("/play?hour_of_code=true", {
        trigger: true,
        replace: true
      });
    },
    'home': go('HomeView'),
    'i18n': go('i18n/I18NHomeView'),
    'i18n/thang/:handle': go('i18n/I18NEditThangTypeView'),
    'i18n/component/:handle': go('i18n/I18NEditComponentView'),
    'i18n/level/:handle': go('i18n/I18NEditLevelView'),
    'i18n/achievement/:handle': go('i18n/I18NEditAchievementView'),
    'i18n/campaign/:handle': go('i18n/I18NEditCampaignView'),
    'i18n/poll/:handle': go('i18n/I18NEditPollView'),
    'i18n/course/:handle': go('i18n/I18NEditCourseView'),
    'identify': go('user/IdentifyView'),
    'il-signup': go('account/IsraelSignupView'),
    'legal': go('LegalView'),
    'play(/)': go('play/CampaignView'),
    'play/ladder/:levelID/:leagueType/:leagueID': go('ladder/LadderView'),
    'play/ladder/:levelID': go('ladder/LadderView'),
    'play/ladder': go('ladder/MainLadderView'),
    'play/level/:levelID': go('play/level/PlayLevelView'),
    'play/game-dev-level/:levelID/:sessionID': go('play/level/PlayGameDevLevelView'),
    'play/web-dev-level/:levelID/:sessionID': go('play/level/PlayWebDevLevelView'),
    'play/spectate/:levelID': go('play/SpectateView'),
    'play/:map': go('play/CampaignView'),
    'preview': go('HomeView'),
    'privacy': go('PrivacyView'),
    'schools': go('HomeView'),
    'seen': go('HomeView'),
    'SEEN': go('HomeView'),
    'students': go('courses/CoursesView', {
      redirectTeachers: true
    }),
    'students/update-account': go('courses/CoursesUpdateAccountView', {
      redirectTeachers: true
    }),
    'students/:classroomID': go('courses/ClassroomView', {
      redirectTeachers: true,
      studentsOnly: true
    }),
    'students/:courseID/:courseInstanceID': go('courses/CourseDetailsView', {
      redirectTeachers: true,
      studentsOnly: true
    }),
    'teachers': redirect('/teachers/classes'),
    'teachers/classes': go('courses/TeacherClassesView', {
      redirectStudents: true,
      teachersOnly: true
    }),
    'teachers/classes/:classroomID/:studentID': go('teachers/TeacherStudentView', {
      redirectStudents: true,
      teachersOnly: true
    }),
    'teachers/classes/:classroomID': go('courses/TeacherClassView', {
      redirectStudents: true,
      teachersOnly: true
    }),
    'teachers/courses': go('courses/TeacherCoursesView', {
      redirectStudents: true
    }),
    'teachers/course-solution/:courseID/:language': go('teachers/TeacherCourseSolutionView', {
      redirectStudents: true
    }),
    'teachers/demo': go('teachers/RequestQuoteView', {
      redirectStudents: true
    }),
    'teachers/enrollments': redirect('/teachers/licenses'),
    'teachers/licenses': go('courses/EnrollmentsView', {
      redirectStudents: true,
      teachersOnly: true
    }),
    'teachers/freetrial': go('teachers/RequestQuoteView', {
      redirectStudents: true
    }),
    'teachers/quote': redirect('/teachers/demo'),
    'teachers/resources': go('teachers/ResourceHubView', {
      redirectStudents: true
    }),
    'teachers/resources/:name': go('teachers/MarkdownResourceView', {
      redirectStudents: true
    }),
    'teachers/signup': function() {
      if (me.isAnonymous()) {
        return this.routeDirectly('teachers/CreateTeacherAccountView', []);
      }
      if (me.isStudent() && !me.isAdmin()) {
        return this.navigate('/students', {
          trigger: true,
          replace: true
        });
      }
      return this.navigate('/teachers/update-account', {
        trigger: true,
        replace: true
      });
    },
    'teachers/update-account': function() {
      if (me.isAnonymous()) {
        return this.navigate('/teachers/signup', {
          trigger: true,
          replace: true
        });
      }
      if (me.isStudent() && !me.isAdmin()) {
        return this.navigate('/students', {
          trigger: true,
          replace: true
        });
      }
      return this.routeDirectly('teachers/ConvertToTeacherAccountView', []);
    },
    'test(/*subpath)': go('TestView'),
    'user/:slugOrID': go('user/MainUserView'),
    'user/:userID/verify/:verificationCode': go('user/EmailVerifiedView'),
    '*name/': 'removeTrailingSlash',
    '*name': go('NotFoundView')
  };

  CocoRouter.prototype.routeToServer = function(e) {
    return window.location.href = window.location.href;
  };

  CocoRouter.prototype.removeTrailingSlash = function(e) {
    return this.navigate(e, {
      trigger: true
    });
  };

  CocoRouter.prototype.routeDirectly = function(path, args, options) {
    var ViewClass, leavingMessage, view;
    if (args == null) {
      args = [];
    }
    if (options == null) {
      options = {};
    }
    if (options.redirectStudents && me.isStudent() && !me.isAdmin()) {
      return this.navigate('/students', {
        trigger: true,
        replace: true
      });
    }
    if (options.redirectTeachers && me.isTeacher() && !me.isAdmin()) {
      return this.navigate('/teachers', {
        trigger: true,
        replace: true
      });
    }
    if (options.teachersOnly && !(me.isTeacher() || me.isAdmin())) {
      return this.routeDirectly('teachers/RestrictedToTeachersView');
    }
    if (options.studentsOnly && !(me.isStudent() || me.isAdmin())) {
      return this.routeDirectly('courses/RestrictedToStudentsView');
    }
    leavingMessage = _.result(window.currentView, 'onLeaveMessage');
    if (leavingMessage) {
      if (!confirm(leavingMessage)) {
        return this.navigate(this.path, {
          replace: true
        });
      } else {
        window.currentView.onLeaveMessage = _.noop;
      }
    }
    if (window.serverConfig.picoCTF && !/^(views)?\/?play/.test(path)) {
      path = 'play/CampaignView';
    }
    if (!_.string.startsWith(path, 'views/')) {
      path = "views/" + path;
    }
    ViewClass = this.tryToLoadModule(path);
    if (!ViewClass && application.moduleLoader.load(path)) {
      this.listenToOnce(application.moduleLoader, 'load-complete', function() {
        return this.routeDirectly(path, args, options);
      });
      return;
    }
    if (!ViewClass) {
      return go('NotFoundView');
    }
    view = (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(ViewClass, [options].concat(slice.call(args)), function(){});
    view.render();
    return this.openView(view);
  };

  CocoRouter.prototype.tryToLoadModule = function(path) {
    var error, error1;
    try {
      return require(path);
    } catch (error1) {
      error = error1;
      if (error.toString().search('Cannot find module "' + path + '" from') === -1) {
        throw error;
      }
    }
  };

  CocoRouter.prototype.openView = function(view) {
    this.closeCurrentView();
    $('#page-container').empty().append(view.el);
    window.currentView = view;
    this.activateTab();
    view.afterInsert();
    view.didReappear();
    return this.path = document.location.pathname + document.location.search;
  };

  CocoRouter.prototype.closeCurrentView = function() {
    var ref, ref1;
    if ((ref = window.currentView) != null ? ref.reloadOnClose : void 0) {
      return document.location.reload();
    }
    if ((ref1 = window.currentModal) != null) {
      if (typeof ref1.hide === "function") {
        ref1.hide();
      }
    }
    if (window.currentView == null) {
      return;
    }
    window.currentView.destroy();
    $('.popover').popover('hide');
    $('#flying-focus').css({
      top: 0,
      left: 0
    });
    return _.delay((function() {
      $('html')[0].scrollTop = 0;
      return $('body')[0].scrollTop = 0;
    }), 10);
  };

  CocoRouter.prototype.initializeSocialMediaServices = function() {
    if (application.testing || application.demoing) {
      return;
    }
    application.facebookHandler.loadAPI();
    application.gplusHandler.loadAPI();
    return require('core/services/twitter')();
  };

  CocoRouter.prototype.renderSocialButtons = function() {
    var ref;
    this.initializeSocialMediaServices();
    $('.share-buttons, .partner-badges').addClass('fade-in').delay(10000).removeClass('fade-in', 5000);
    application.facebookHandler.renderButtons();
    application.gplusHandler.renderButtons();
    return typeof twttr !== "undefined" && twttr !== null ? (ref = twttr.widgets) != null ? typeof ref.load === "function" ? ref.load() : void 0 : void 0 : void 0;
  };

  CocoRouter.prototype.activateTab = function() {
    var base;
    base = _.string.words(document.location.pathname.slice(1), '/')[0];
    return $("ul.nav li." + base).addClass('active');
  };

  CocoRouter.prototype._trackPageView = function() {
    var ref;
    return (ref = window.tracker) != null ? ref.trackPageView() : void 0;
  };

  CocoRouter.prototype.onNavigate = function(e) {
    var ViewClass, args, manualView, view;
    if (_.isString(e.viewClass)) {
      ViewClass = this.tryToLoadModule(e.viewClass);
      if (!ViewClass && application.moduleLoader.load(e.viewClass)) {
        this.listenToOnce(application.moduleLoader, 'load-complete', function() {
          return this.onNavigate(e);
        });
        return;
      }
      e.viewClass = ViewClass;
    }
    manualView = e.view || e.viewClass;
    if ((e.route === document.location.pathname) && !manualView) {
      return document.location.reload();
    }
    this.navigate(e.route, {
      trigger: !manualView
    });
    this._trackPageView();
    if (!manualView) {
      return;
    }
    if (e.viewClass) {
      args = e.viewArgs || [];
      view = (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(e.viewClass, args, function(){});
      view.render();
      return this.openView(view);
    } else {
      return this.openView(e.view);
    }
  };

  CocoRouter.prototype.navigate = function(fragment, options) {
    CocoRouter.__super__.navigate.call(this, fragment, options);
    return Backbone.Mediator.publish('router:navigated', {
      route: fragment
    });
  };

  CocoRouter.prototype.reload = function() {
    return document.location.reload();
  };

  return CocoRouter;

})(Backbone.Router);
});

;require.register("core/SystemNameLoader", function(exports, require, module) {
var CocoClass, SystemNameLoader, namesCache,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoClass = require('./CocoClass');

namesCache = {};

SystemNameLoader = (function(superClass) {
  extend(SystemNameLoader, superClass);

  function SystemNameLoader() {
    return SystemNameLoader.__super__.constructor.apply(this, arguments);
  }

  SystemNameLoader.prototype.getName = function(id) {
    var ref;
    return (ref = namesCache[id]) != null ? ref.name : void 0;
  };

  SystemNameLoader.prototype.setName = function(system) {
    return namesCache[system.get('original')] = {
      name: system.get('name')
    };
  };

  return SystemNameLoader;

})(CocoClass);

module.exports = new SystemNameLoader();
});

;require.register("core/Tracker", function(exports, require, module) {
var CocoClass, SuperModel, Tracker, debugAnalytics, me, targetInspectJSLevelSlugs, utils,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

me = require('core/auth').me;

SuperModel = require('models/SuperModel');

utils = require('core/utils');

CocoClass = require('core/CocoClass');

debugAnalytics = false;

targetInspectJSLevelSlugs = ['cupboards-of-kithgard'];

module.exports = Tracker = (function(superClass) {
  extend(Tracker, superClass);

  Tracker.prototype.subscriptions = {
    'application:service-loaded': 'onServiceLoaded'
  };

  function Tracker() {
    this.trackEventInternal = bind(this.trackEventInternal, this);
    this.trackEvent = bind(this.trackEvent, this);
    Tracker.__super__.constructor.call(this);
    if (window.tracker) {
      console.error('Overwrote our Tracker!', window.tracker);
    }
    window.tracker = this;
    this.isProduction = document.location.href.search('codecombat.com') !== -1;
    this.trackReferrers();
    this.identify();
    this.supermodel = new SuperModel();
    if (me.get('role')) {
      this.updateRole();
    }
  }

  Tracker.prototype.enableInspectletJS = function(levelSlug) {
    var insp, scriptLoaded, x;
    if (indexOf.call(targetInspectJSLevelSlugs, levelSlug) < 0) {
      return this.disableInspectletJS();
    }
    scriptLoaded = (function(_this) {
      return function() {
        var ref;
        _this.identify();
        return (ref = window.__insp) != null ? ref.push(['virtualPage']) : void 0;
      };
    })(this);
    window.__insp = [['wid', 2102699786]];
    insp = document.createElement('script');
    insp.type = 'text/javascript';
    insp.async = true;
    insp.id = 'inspsync';
    insp.src = ('https:' === document.location.protocol ? 'https' : 'http') + '://cdn.inspectlet.com/inspectlet.js';
    insp.onreadystatechange = function() {
      if (insp.readyState === 'complete') {
        return scriptLoaded();
      }
    };
    insp.onload = scriptLoaded;
    x = document.getElementsByTagName('script')[0];
    return this.inspectletScriptNode = x.parentNode.insertBefore(insp, x);
  };

  Tracker.prototype.disableInspectletJS = function() {
    var x;
    if (this.inspectletScriptNode) {
      x = document.getElementsByTagName('script')[0];
      x.parentNode.removeChild(this.inspectletScriptNode);
      this.inspectletScriptNode = null;
    }
    return delete window.__insp;
  };

  Tracker.prototype.trackReferrers = function() {
    var changed, elapsed, referrer, siteref;
    elapsed = new Date() - new Date(me.get('dateCreated'));
    if (!(elapsed < 5 * 60 * 1000)) {
      return;
    }
    if (me.get('siteref') || me.get('referrer')) {
      return;
    }
    changed = false;
    if (siteref = utils.getQueryVariable('_r')) {
      me.set('siteref', siteref);
      changed = true;
    }
    if (referrer = document.referrer) {
      me.set('referrer', referrer);
      changed = true;
    }
    if (changed) {
      return me.patch();
    }
  };

  Tracker.prototype.identify = function(traits) {
    var i, key, len, ref, userTrait, value;
    if (traits == null) {
      traits = {};
    }
    if (!me) {
      return;
    }
    if (this.explicitTraits == null) {
      this.explicitTraits = {};
    }
    for (key in traits) {
      value = traits[key];
      this.explicitTraits[key] = value;
    }
    ref = ['email', 'anonymous', 'dateCreated', 'name', 'testGroupNumber', 'gender', 'lastLevel', 'siteref', 'ageRange', 'schoolName', 'coursePrepaidID', 'role'];
    for (i = 0, len = ref.length; i < len; i++) {
      userTrait = ref[i];
      if (traits[userTrait] == null) {
        traits[userTrait] = me.get(userTrait);
      }
    }
    if (me.isTeacher()) {
      traits.teacher = true;
    }
    if (debugAnalytics) {
      console.log('Would identify', me.id, traits);
    }
    if (!(this.isProduction && !me.isAdmin())) {
      return;
    }
    if (typeof _errs !== "undefined" && _errs !== null) {
      _errs.meta = traits;
    }
    if (typeof __insp !== "undefined" && __insp !== null) {
      __insp.push(['identify', me.id]);
    }
    if (typeof __insp !== "undefined" && __insp !== null) {
      __insp.push(['tagSession', traits]);
    }
    mixpanel.identify(me.id);
    mixpanel.register(traits);
    if (me.isTeacher() && this.segmentLoaded) {
      traits.createdAt = me.get('dateCreated');
      return analytics.identify(me.id, traits);
    }
  };

  Tracker.prototype.trackPageView = function(includeIntegrations) {
    var i, includeMixpanel, integration, len, name, options, url;
    if (includeIntegrations == null) {
      includeIntegrations = [];
    }
    includeMixpanel = function(name) {
      var mixpanelIncludes;
      mixpanelIncludes = [];
      return indexOf.call(mixpanelIncludes, name) >= 0 || /courses|students|teachers/ig.test(name);
    };
    name = Backbone.history.getFragment();
    url = "/" + name;
    if (debugAnalytics) {
      console.log("Would track analytics pageview: " + url + " Mixpanel=" + (includeMixpanel(name)));
    }
    if (!((me != null ? me.isAdmin() : void 0) && this.isProduction)) {
      this.trackEventInternal('Pageview', {
        url: name
      });
    }
    if (!(this.isProduction && !me.isAdmin())) {
      return;
    }
    if (typeof ga === "function") {
      ga('send', 'pageview', url);
    }
    if (includeMixpanel(name)) {
      mixpanel.track('page viewed', {
        'page name': name,
        url: url
      });
    }
    if (me.isTeacher() && this.segmentLoaded) {
      options = {};
      if (includeIntegrations != null ? includeIntegrations.length : void 0) {
        options.integrations = {
          All: false
        };
        for (i = 0, len = includeIntegrations.length; i < len; i++) {
          integration = includeIntegrations[i];
          options.integrations[integration] = true;
        }
      }
      return analytics.page(url, {}, options);
    }
  };

  Tracker.prototype.trackEvent = function(action, properties, includeIntegrations) {
    var gaFieldObject, i, integration, len, options, ref;
    if (properties == null) {
      properties = {};
    }
    if (includeIntegrations == null) {
      includeIntegrations = [];
    }
    if (!((me != null ? me.isAdmin() : void 0) && this.isProduction)) {
      this.trackEventInternal(action, _.cloneDeep(properties));
    }
    if (debugAnalytics) {
      console.log('Tracking external analytics event:', action, properties, includeIntegrations);
    }
    if (!(me && this.isProduction && !me.isAdmin())) {
      return;
    }
    gaFieldObject = {
      hitType: 'event',
      eventCategory: (ref = properties.category) != null ? ref : 'All',
      eventAction: action
    };
    if (properties.label != null) {
      gaFieldObject.eventLabel = properties.label;
    }
    if (properties.value != null) {
      gaFieldObject.eventValue = properties.value;
    }
    if (typeof ga === "function") {
      ga('send', gaFieldObject);
    }
    if (typeof __insp !== "undefined" && __insp !== null) {
      __insp.push([
        'tagSession', {
          action: action,
          properies: properties
        }
      ]);
    }
    if (indexOf.call(includeIntegrations, 'Mixpanel') >= 0) {
      mixpanel.track(action, properties);
    }
    if (me.isTeacher() && this.segmentLoaded) {
      options = {};
      if (includeIntegrations) {
        options.integrations = {
          All: false
        };
        for (i = 0, len = includeIntegrations.length; i < len; i++) {
          integration = includeIntegrations[i];
          options.integrations[integration] = true;
        }
      }
      return typeof analytics !== "undefined" && analytics !== null ? analytics.track(action, {}, options) : void 0;
    }
  };

  Tracker.prototype.trackEventInternal = function(event, properties) {
    var key, ref, request, value;
    if (event === 'Simulator Result' || event === 'Started Level Load' || event === 'Finished Level Load') {
      return;
    }
    if (event === 'Clicked Start Level' || event === 'Inventory Play' || event === 'Heard Sprite' || event === 'Started Level' || event === 'Saw Victory' || event === 'Click Play' || event === 'Choose Inventory' || event === 'Homepage Loaded' || event === 'Change Hero') {
      delete properties.category;
      delete properties.label;
    } else if (event === 'Loaded World Map' || event === 'Started Signup' || event === 'Finished Signup' || event === 'Login' || event === 'Facebook Login' || event === 'Google Login' || event === 'Show subscription modal') {
      delete properties.category;
    }
    if (this.explicitTraits != null) {
      ref = this.explicitTraits;
      for (key in ref) {
        value = ref[key];
        properties[key] = value;
      }
    }
    if (debugAnalytics) {
      console.log('Tracking internal analytics event:', event, properties);
    }
    request = this.supermodel.addRequestResource({
      url: '/db/analytics.log.event/-/log_event',
      data: {
        event: event,
        properties: properties
      },
      method: 'POST'
    }, 0);
    return request.load();
  };

  Tracker.prototype.trackTiming = function(duration, category, variable, label) {
    if (!(duration >= 0 && duration < 60 * 60 * 1000)) {
      return console.warn("Duration " + duration + " invalid for trackTiming call.");
    }
    if (debugAnalytics) {
      console.log('Would track timing event:', arguments);
    }
    if (!(me && this.isProduction && !me.isAdmin())) {
      return;
    }
    return typeof ga === "function" ? ga('send', 'timing', category, variable, duration, label) : void 0;
  };

  Tracker.prototype.updateRole = function() {
    if (me.isAdmin()) {
      return;
    }
    if (!me.isTeacher()) {
      return;
    }
    if (!this.segmentLoaded) {
      return require('core/services/segment')();
    }
    return this.identify();
  };

  Tracker.prototype.onServiceLoaded = function(e) {
    if (e.service !== 'segment') {
      return;
    }
    this.segmentLoaded = true;
    return this.updateRole();
  };

  return Tracker;

})(CocoClass);
});

;require.register("core/application", function(exports, require, module) {
var Application, COMMON_FILES, CocoModel, FacebookHandler, GPlusHandler, GitHubHandler, ModuleLoader, Tracker, ctrlDefaultPrevented, elementAcceptsKeystrokes, locale, me, preload, preventBackspace,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

FacebookHandler = require('core/social-handlers/FacebookHandler');

GPlusHandler = require('core/social-handlers/GPlusHandler');

GitHubHandler = require('core/social-handlers/GitHubHandler');

ModuleLoader = require('core/ModuleLoader');

locale = require('locale/locale');

me = require('core/auth').me;

Tracker = require('core/Tracker');

CocoModel = require('models/CocoModel');

marked.setOptions({
  gfm: true,
  sanitize: true,
  smartLists: true,
  breaks: false
});

window.SPRITE_RESOLUTION_FACTOR = 3;

window.SPRITE_PLACEHOLDER_WIDTH = 60;

ctrlDefaultPrevented = [219, 221, 80, 83];

preventBackspace = function(event) {
  var ref;
  if (event.keyCode === 8 && !elementAcceptsKeystrokes(event.srcElement || event.target)) {
    return event.preventDefault();
  } else if ((event.ctrlKey || event.metaKey) && !event.altKey && (ref = event.keyCode, indexOf.call(ctrlDefaultPrevented, ref) >= 0)) {
    console.debug("Prevented keystroke", key, event);
    return event.preventDefault();
  }
};

elementAcceptsKeystrokes = function(el) {
  var ref, ref1, tag, textInputTypes, type;
  if (el == null) {
    el = document.activeElement;
  }
  tag = el.tagName.toLowerCase();
  type = (ref = el.type) != null ? ref.toLowerCase() : void 0;
  textInputTypes = ['text', 'password', 'file', 'number', 'search', 'url', 'tel', 'email', 'date', 'month', 'week', 'time', 'datetimelocal'];
  return (tag === 'textarea' || (tag === 'input' && indexOf.call(textInputTypes, type) >= 0) || ((ref1 = el.contentEditable) === '' || ref1 === 'true')) && !(el.readOnly || el.disabled);
};

COMMON_FILES = ['/images/pages/base/modal_background.png', '/images/level/popover_background.png', '/images/level/code_palette_wood_background.png', '/images/level/code_editor_background_border.png'];

preload = function(arrayOfImages) {
  return $(arrayOfImages).each(function() {
    return $('<img/>')[0].src = this;
  });
};

if (window.console == null) {
  window.console = {
    info: function() {},
    log: function() {},
    error: function() {},
    debug: function() {}
  };
}

if (console.debug == null) {
  console.debug = console.log;
}

Application = {
  initialize: function() {
    var Router, ref;
    Router = require('core/Router');
    this.isProduction = function() {
      return document.location.href.search('https?://localhost') === -1;
    };
    this.isIPadApp = ((typeof webkit !== "undefined" && webkit !== null ? webkit.messageHandlers : void 0) != null) && ((ref = navigator.userAgent) != null ? ref.indexOf('CodeCombat-iPad') : void 0) !== -1;
    if (this.isIPadApp) {
      $('body').addClass('ipad');
    }
    if (window.serverConfig.picoCTF) {
      $('body').addClass('picoctf');
    }
    if ($.browser.msie && parseInt($.browser.version) === 10) {
      $("html").addClass("ie10");
    }
    this.tracker = new Tracker();
    this.facebookHandler = new FacebookHandler();
    this.gplusHandler = new GPlusHandler();
    this.githubHandler = new GitHubHandler();
    this.moduleLoader = new ModuleLoader();
    this.moduleLoader.loadLanguage(me.get('preferredLanguage', true));
    $(document).bind('keydown', preventBackspace);
    preload(COMMON_FILES);
    CocoModel.pollAchievements();
    if (!me.get('anonymous')) {
      me.on('change:earned', function(user, newEarned) {
        var newHeroes, newItems, newLevels, oldEarned, ref1;
        if (newEarned == null) {
          newEarned = {};
        }
        oldEarned = (ref1 = user.previous('earned')) != null ? ref1 : {};
        if (oldEarned.gems !== newEarned.gems) {
          console.log('Gems changed', oldEarned.gems, '->', newEarned.gems);
        }
        newLevels = _.difference(newEarned.levels, oldEarned.levels);
        if (newLevels.length) {
          console.log('Levels added', newLevels);
        }
        newItems = _.difference(newEarned.items, oldEarned.items);
        if (newItems.length) {
          console.log('Items added', newItems);
        }
        newHeroes = _.difference(newEarned.heroes, oldEarned.heroes);
        if (newHeroes.length) {
          return console.log('Heroes added', newHeroes);
        }
      });
      me.on('change:points', function(user, newPoints) {
        return console.log('Points changed', user.previous('points'), '->', newPoints);
      });
      this.checkForNewAchievement();
    }
    return $.i18n.init({
      lng: me.get('preferredLanguage', true),
      fallbackLng: 'en',
      resStore: locale,
      useDataAttrOptions: true
    }, (function(_this) {
      return function(t) {
        var onIdleChanged;
        _this.router = new Router();
        onIdleChanged = function(to) {
          return function() {
            return Backbone.Mediator.publish('application:idle-changed', {
              idle: _this.userIsIdle = to
            });
          };
        };
        _this.idleTracker = new Idle({
          onAway: onIdleChanged(true),
          onAwayBack: onIdleChanged(false),
          onHidden: onIdleChanged(true),
          onVisible: onIdleChanged(false),
          awayTimeout: 5 * 60 * 1000
        });
        return _this.idleTracker.start();
      };
    })(this));
  },
  checkForNewAchievement: function() {
    var daysSince, startFrom;
    if (me.get('lastAchievementChecked')) {
      startFrom = new Date(me.get('lastAchievementChecked'));
    } else {
      startFrom = me.created();
    }
    daysSince = moment.duration(new Date() - startFrom).asDays();
    if (daysSince > 1) {
      return me.checkForNewAchievement().then((function(_this) {
        return function() {
          return _this.checkForNewAchievement();
        };
      })(this));
    }
  }
};

module.exports = Application;

window.application = Application;
});

;require.register("core/auth", function(exports, require, module) {
var BEEN_HERE_BEFORE_KEY, User, backboneFailure, genericFailure, init, onSetVolume, parseServerError, ref, storage, trackFirstArrival;

ref = require('core/errors'), backboneFailure = ref.backboneFailure, genericFailure = ref.genericFailure, parseServerError = ref.parseServerError;

User = require('models/User');

storage = require('core/storage');

BEEN_HERE_BEFORE_KEY = 'beenHereBefore';

init = function() {
  module.exports.me = window.me = new User(window.userObject);
  module.exports.me.onLoaded();
  trackFirstArrival();
  if (me && (me.get('testGroupNumber') == null)) {
    me.set('testGroupNumber', Math.floor(Math.random() * 256));
    me.patch();
  }
  return Backbone.listenTo(me, 'sync', function() {
    return Backbone.Mediator.publish('auth:me-synced', {
      me: me
    });
  });
};

module.exports.logoutUser = function() {
  var callback, res;
  if (typeof FB !== "undefined" && FB !== null) {
    if (typeof FB.logout === "function") {
      FB.logout();
    }
  }
  callback = function() {
    var location;
    location = _.result(currentView, 'logoutRedirectURL');
    if (location) {
      return window.location = location;
    } else {
      return window.location.reload();
    }
  };
  res = $.post('/auth/logout', {}, callback);
  return res.fail(genericFailure);
};

module.exports.sendRecoveryEmail = function(email, options) {
  if (options == null) {
    options = {};
  }
  options = _.merge(options, {
    method: 'POST',
    url: '/auth/reset',
    data: {
      email: email
    }
  });
  return $.ajax(options);
};

onSetVolume = function(e) {
  if (e.volume === me.get('volume')) {
    return;
  }
  me.set('volume', e.volume);
  return me.save();
};

Backbone.Mediator.subscribe('level:set-volume', onSetVolume, module.exports);

trackFirstArrival = function() {
  var beenHereBefore, ref1;
  beenHereBefore = storage.load(BEEN_HERE_BEFORE_KEY);
  if (beenHereBefore) {
    return;
  }
  if ((ref1 = window.tracker) != null) {
    ref1.trackEvent('First Arrived');
  }
  return storage.save(BEEN_HERE_BEFORE_KEY, true);
};

init();
});

;require.register("core/contact", function(exports, require, module) {
module.exports = {
  sendContactMessage: function(contactMessageObject, modal) {
    if (modal != null) {
      modal.find('.sending-indicator').show();
    }
    return $.post('/contact', contactMessageObject, function(response) {
      if (!modal) {
        return;
      }
      modal.find('.sending-indicator').hide();
      modal.find('#contact-message').val('Thanks!');
      return _.delay(function() {
        modal.find('#contact-message').val('');
        return modal.modal('hide');
      }, 1000);
    });
  },
  send: function(options) {
    if (options == null) {
      options = {};
    }
    options.type = 'POST';
    options.url = '/contact';
    return $.ajax(options);
  },
  sendParentSignupInstructions: function(parentEmail) {
    var jqxhr;
    jqxhr = $.ajax('/contact/send-parent-signup-instructions', {
      method: 'POST',
      data: {
        parentEmail: parentEmail
      }
    });
    return new Promise(jqxhr.then);
  }
};
});

;require.register("core/d3_utils", function(exports, require, module) {
module.exports.createContiguousDays = function(timeframeDays, skipToday) {
  var currentDate, currentDay, days, i, j, ref;
  if (skipToday == null) {
    skipToday = true;
  }
  days = [];
  currentDate = new Date();
  currentDate.setUTCDate(currentDate.getUTCDate() - timeframeDays + 1);
  if (skipToday) {
    currentDate.setUTCDate(currentDate.getUTCDate() - 1);
  }
  for (i = j = 0, ref = timeframeDays; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
    currentDay = currentDate.toISOString().substr(0, 10);
    days.push(currentDay);
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }
  return days;
};

module.exports.createLineChart = function(containerSelector, chartLines, containerWidth) {
  var containerHeight, currentLine, currentYScale, d3line, endDay, height, i, j, k, keyHeight, len, len1, line, lineColor, margin, marks, results, startDay, svg, width, xAxis, xAxisHeight, xAxisRange, xRange, yAxis, yAxisRange, yAxisWidth, yRange, yScaleCount;
  if (!((chartLines != null ? chartLines.length : void 0) > 0 && containerSelector)) {
    return;
  }
  margin = 20;
  keyHeight = 20;
  xAxisHeight = 20;
  yAxisWidth = 40;
  if (!containerWidth) {
    containerWidth = $(containerSelector).width();
  }
  containerHeight = $(containerSelector).height();
  yScaleCount = 0;
  for (j = 0, len = chartLines.length; j < len; j++) {
    line = chartLines[j];
    if (line.showYScale) {
      yScaleCount++;
    }
  }
  svg = d3.select(containerSelector).append("svg").attr("width", containerWidth).attr("height", containerHeight);
  width = containerWidth - margin * 2 - yAxisWidth * yScaleCount;
  height = containerHeight - margin * 2 - xAxisHeight - keyHeight * chartLines.length;
  currentLine = 0;
  currentYScale = 0;
  marks = (function() {
    var k, results;
    results = [];
    for (i = k = 1; k <= 5; i = ++k) {
      results.push(Math.round(i * height / 5));
    }
    return results;
  })();
  yRange = d3.scale.linear().range([height, 0]).domain([0, height]);
  svg.selectAll(".line").data(marks).enter().append("line").attr("x1", margin + yAxisWidth * yScaleCount).attr("y1", function(d) {
    return margin + yRange(d);
  }).attr("x2", margin + yAxisWidth * yScaleCount + width).attr("y2", function(d) {
    return margin + yRange(d);
  }).attr("stroke", 'gray').style("opacity", "0.3");
  results = [];
  for (k = 0, len1 = chartLines.length; k < len1; k++) {
    line = chartLines[k];
    xRange = d3.scale.linear().range([0, width]).domain([
      d3.min(line.points, function(d) {
        return d.x;
      }), d3.max(line.points, function(d) {
        return d.x;
      })
    ]);
    yRange = d3.scale.linear().range([height, 0]).domain([line.min, line.max]);
    if (currentLine === 0) {
      startDay = new Date(line.points[0].day);
      endDay = new Date(line.points[line.points.length - 1].day);
      xAxisRange = d3.time.scale().domain([startDay, endDay]).range([0, width]);
      xAxis = d3.svg.axis().scale(xAxisRange);
      svg.append("g").attr("class", "x axis").call(xAxis).selectAll("text").attr("dy", ".35em").attr("transform", "translate(" + (margin + yAxisWidth * yScaleCount) + "," + (height + margin) + ")").style("text-anchor", "start");
    }
    if (line.showYScale) {
      lineColor = yScaleCount > 1 ? line.lineColor : 'black';
      yAxisRange = d3.scale.linear().range([height, 0]).domain([line.min, line.max]);
      yAxis = d3.svg.axis().scale(yRange).orient("left");
      svg.append("g").attr("class", "y axis").attr("transform", "translate(" + (margin + yAxisWidth * currentYScale) + "," + margin + ")").style("color", lineColor).call(yAxis).selectAll("text").attr("y", 0).attr("x", 0).attr("fill", lineColor).style("text-anchor", "start");
      currentYScale++;
    }
    svg.append("line").attr("x1", margin).attr("y1", margin + height + xAxisHeight + keyHeight * currentLine + keyHeight / 2).attr("x2", margin + 40).attr("y2", margin + height + xAxisHeight + keyHeight * currentLine + keyHeight / 2).attr("stroke", line.lineColor).attr("class", "key-line");
    svg.append("text").attr("x", margin + 40 + 10).attr("y", margin + height + xAxisHeight + keyHeight * currentLine + (keyHeight + 10) / 2).attr("fill", line.lineColor).attr("class", "key-text").text(line.description);
    svg.selectAll(".circle").data(line.points).enter().append("circle").attr("transform", "translate(" + (margin + yAxisWidth * yScaleCount) + "," + margin + ")").attr("cx", function(d) {
      return xRange(d.x);
    }).attr("cy", function(d) {
      return yRange(d.y);
    }).attr("r", 2).attr("fill", line.lineColor).attr("stroke-width", 1).attr("class", "graph-point").attr("data-pointid", function(d) {
      return "" + line.lineID + d.x;
    });
    d3line = d3.svg.line().x(function(d) {
      return xRange(d.x);
    }).y(function(d) {
      return yRange(d.y);
    }).interpolate("linear");
    svg.append("path").attr("d", d3line(line.points)).attr("transform", "translate(" + (margin + yAxisWidth * yScaleCount) + "," + margin + ")").style("stroke-width", line.strokeWidth).style("stroke", line.lineColor).style("fill", "none");
    results.push(currentLine++);
  }
  return results;
};
});

;require.register("core/deltas", function(exports, require, module) {
var SystemNameLoader, expandFlattenedDelta, flattenDelta, groupDeltasByAffectingPaths, objectHash, prunePath;

SystemNameLoader = require('./../core/SystemNameLoader');


/*
  Good-to-knows:
    dataPath: an array of keys that walks you up a JSON object that's being patched
      ex: ['scripts', 0, 'description']
    deltaPath: an array of keys that walks you up a JSON Diff Patch object.
      ex: ['scripts', '_0', 'description']
 */

module.exports.expandDelta = function(delta, left, schema) {
  var fd, flattenedDeltas, j, len, results1, right;
  if (left != null) {
    right = jsondiffpatch.clone(left);
    jsondiffpatch.patch(right, delta);
  }
  flattenedDeltas = flattenDelta(delta);
  results1 = [];
  for (j = 0, len = flattenedDeltas.length; j < len; j++) {
    fd = flattenedDeltas[j];
    results1.push(expandFlattenedDelta(fd, left, right, schema));
  }
  return results1;
};

module.exports.flattenDelta = flattenDelta = function(delta, dataPath, deltaPath) {
  var affectingArray, childDelta, dataIndex, deltaIndex, results;
  if (dataPath == null) {
    dataPath = null;
  }
  if (deltaPath == null) {
    deltaPath = null;
  }
  if (!delta) {
    return [];
  }
  if (dataPath == null) {
    dataPath = [];
  }
  if (deltaPath == null) {
    deltaPath = [];
  }
  if (_.isArray(delta)) {
    return [
      {
        dataPath: dataPath,
        deltaPath: deltaPath,
        o: delta
      }
    ];
  }
  results = [];
  affectingArray = delta._t === 'a';
  for (deltaIndex in delta) {
    childDelta = delta[deltaIndex];
    if (deltaIndex === '_t') {
      continue;
    }
    dataIndex = affectingArray ? parseInt(deltaIndex.replace('_', '')) : deltaIndex;
    results = results.concat(flattenDelta(childDelta, dataPath.concat([dataIndex]), deltaPath.concat([deltaIndex])));
  }
  return results;
};

expandFlattenedDelta = function(delta, left, right, schema) {
  var childLeft, childRight, childSchema, humanKey, humanPath, i, j, key, len, o, parentLeft, parentRight, parentSchema, ref, ref1;
  delta.action = '???';
  o = delta.o;
  humanPath = [];
  parentLeft = left;
  parentRight = right;
  parentSchema = schema;
  ref = delta.dataPath;
  for (i = j = 0, len = ref.length; j < len; i = ++j) {
    key = ref[i];
    childSchema = (parentSchema != null ? parentSchema.items : void 0) || (parentSchema != null ? (ref1 = parentSchema.properties) != null ? ref1[key] : void 0 : void 0) || {};
    childLeft = parentLeft != null ? parentLeft[key] : void 0;
    childRight = parentRight != null ? parentRight[key] : void 0;
    humanKey = null;
    if (childRight) {
      if (humanKey == null) {
        humanKey = childRight.name || childRight.id;
      }
    }
    if (humanKey == null) {
      humanKey = SystemNameLoader.getName(childRight != null ? childRight.original : void 0);
    }
    if (childSchema.title) {
      if (humanKey == null) {
        humanKey = "" + childSchema.title;
      }
    }
    if (humanKey == null) {
      humanKey = _.string.titleize(key);
    }
    humanPath.push(humanKey);
    parentLeft = childLeft;
    parentRight = childRight;
    parentSchema = childSchema;
  }
  if (!childLeft && childRight) {
    childLeft = jsondiffpatch.patch(childRight, jsondiffpatch.reverse(o));
  }
  if (_.isArray(o) && o.length === 1) {
    delta.action = 'added';
    delta.newValue = o[0];
  }
  if (_.isArray(o) && o.length === 2) {
    delta.action = 'modified';
    delta.oldValue = o[0];
    delta.newValue = o[1];
  }
  if (_.isArray(o) && o.length === 3 && o[1] === 0 && o[2] === 0) {
    delta.action = 'deleted';
    delta.oldValue = o[0];
  }
  if (_.isPlainObject(o) && o._t === 'a') {
    delta.action = 'modified-array';
  }
  if (_.isPlainObject(o) && o._t !== 'a') {
    delta.action = 'modified-object';
  }
  if (_.isArray(o) && o.length === 3 && o[2] === 3) {
    delta.action = 'moved-index';
    delta.destinationIndex = o[1];
    delta.originalIndex = delta.dataPath[delta.dataPath.length - 1];
    delta.hash = objectHash(childRight);
  }
  if (_.isArray(o) && o.length === 3 && o[1] === 0 && o[2] === 2) {
    delta.action = 'text-diff';
    delta.unidiff = o[0];
  }
  delta.humanPath = humanPath.join(' :: ');
  delta.schema = childSchema;
  delta.left = childLeft;
  delta.right = childRight;
  return delta;
};

objectHash = function(obj) {
  if (obj != null) {
    return obj.name || obj.id || obj._id || JSON.stringify(_.keys(obj));
  } else {
    return 'null';
  }
};

module.exports.makeJSONDiffer = function() {
  return jsondiffpatch.create({
    objectHash: objectHash
  });
};

module.exports.getConflicts = function(headDeltas, pendingDeltas) {
  var conflicts, headDelta, headMetaDelta, headPathMap, i, j, l, len, len1, len2, m, nextPath, offset, path, paths, pendingDelta, pendingMetaDelta, pendingPathMap, ref, ref1;
  headPathMap = groupDeltasByAffectingPaths(headDeltas);
  pendingPathMap = groupDeltasByAffectingPaths(pendingDeltas);
  paths = _.keys(headPathMap).concat(_.keys(pendingPathMap));
  conflicts = [];
  paths.sort();
  for (i = j = 0, len = paths.length; j < len; i = ++j) {
    path = paths[i];
    offset = 1;
    while (i + offset < paths.length) {
      nextPath = paths[i + offset];
      offset += 1;
      if (!(_.string.startsWith(nextPath, path))) {
        break;
      }
      if (!(headPathMap[path] || headPathMap[nextPath])) {
        continue;
      }
      if (!(pendingPathMap[path] || pendingPathMap[nextPath])) {
        continue;
      }
      ref = headPathMap[path] || headPathMap[nextPath];
      for (l = 0, len1 = ref.length; l < len1; l++) {
        headMetaDelta = ref[l];
        headDelta = headMetaDelta.delta;
        ref1 = pendingPathMap[path] || pendingPathMap[nextPath];
        for (m = 0, len2 = ref1.length; m < len2; m++) {
          pendingMetaDelta = ref1[m];
          pendingDelta = pendingMetaDelta.delta;
          conflicts.push({
            headDelta: headDelta,
            pendingDelta: pendingDelta
          });
          pendingDelta.conflict = headDelta;
          headDelta.conflict = pendingDelta;
        }
      }
    }
  }
  if (conflicts.length) {
    return conflicts;
  }
};

groupDeltasByAffectingPaths = function(deltas) {
  var conflictPaths, delta, item, j, l, len, len1, map, metaDeltas, path, ref;
  metaDeltas = [];
  for (j = 0, len = deltas.length; j < len; j++) {
    delta = deltas[j];
    conflictPaths = [];
    if (delta.action === 'moved-index') {
      conflictPaths.push(delta.dataPath.slice(0, delta.dataPath.length - 1));
    } else if (((ref = delta.action) === 'deleted' || ref === 'added') && _.isNumber(delta.dataPath[delta.dataPath.length - 1])) {
      conflictPaths.push(delta.dataPath.slice(0, delta.dataPath.length - 1));
    } else {
      conflictPaths.push(delta.dataPath);
    }
    for (l = 0, len1 = conflictPaths.length; l < len1; l++) {
      path = conflictPaths[l];
      metaDeltas.push({
        delta: delta,
        path: ((function() {
          var len2, m, results1;
          results1 = [];
          for (m = 0, len2 = path.length; m < len2; m++) {
            item = path[m];
            results1.push(item.toString());
          }
          return results1;
        })()).join('/')
      });
    }
  }
  map = _.groupBy(metaDeltas, 'path');
  return map;
};

module.exports.pruneConflictsFromDelta = function(delta, conflicts) {
  var conflict, expandedDeltas;
  expandedDeltas = (function() {
    var j, len, results1;
    results1 = [];
    for (j = 0, len = conflicts.length; j < len; j++) {
      conflict = conflicts[j];
      results1.push(conflict.pendingDelta);
    }
    return results1;
  })();
  return module.exports.pruneExpandedDeltasFromDelta(delta, expandedDeltas);
};

module.exports.pruneExpandedDeltasFromDelta = function(delta, expandedDeltas) {
  var expandedDelta, j, len;
  for (j = 0, len = expandedDeltas.length; j < len; j++) {
    expandedDelta = expandedDeltas[j];
    prunePath(delta, expandedDelta.deltaPath);
  }
  if (_.isEmpty(delta)) {
    return void 0;
  } else {
    return delta;
  }
};

prunePath = function(delta, path) {
  var k, keys;
  if (path.length === 1) {
    if (delta[path] !== void 0) {
      return delete delta[path];
    }
  } else {
    if (delta[path[0]] !== void 0) {
      prunePath(delta[path[0]], path.slice(1));
    }
    keys = (function() {
      var j, len, ref, results1;
      ref = _.keys(delta[path[0]]);
      results1 = [];
      for (j = 0, len = ref.length; j < len; j++) {
        k = ref[j];
        if (k !== '_t') {
          results1.push(k);
        }
      }
      return results1;
    })();
    if (keys.length === 0) {
      return delete delta[path[0]];
    }
  }
};

module.exports.DOC_SKIP_PATHS = ['_id', 'version', 'commitMessage', 'parent', 'created', 'slug', 'index', '__v', 'patches', 'creator', 'js', 'watchers', 'levelsUpdated'];
});

;require.register("core/errors", function(exports, require, module) {
var applyErrorsToForm, connectionFailure, errorModalTemplate, showErrorModal;

errorModalTemplate = require('templates/core/error');

applyErrorsToForm = require('core/forms').applyErrorsToForm;

module.exports.parseServerError = function(text) {
  var SyntaxError, error, error1;
  try {
    error = JSON.parse(text) || {
      message: 'Unknown error.'
    };
  } catch (error1) {
    SyntaxError = error1;
    error = {
      message: text || 'Unknown error.'
    };
  }
  if (_.isArray(error)) {
    error = error[0];
  }
  return error;
};

module.exports.genericFailure = function(jqxhr) {
  var error, existingForm, i, len, message, missingErrors, res, results;
  Backbone.Mediator.publish('errors:server-error', {
    response: jqxhr
  });
  if (!jqxhr.status) {
    return connectionFailure();
  }
  error = module.exports.parseServerError(jqxhr.responseText);
  message = error.message;
  if (error.property) {
    message = error.property + ' ' + message;
  }
  console.warn(jqxhr.status, jqxhr.statusText, error);
  existingForm = $('.form:visible:first');
  if (existingForm[0]) {
    missingErrors = applyErrorsToForm(existingForm, [error]);
    results = [];
    for (i = 0, len = missingErrors.length; i < len; i++) {
      error = missingErrors[i];
      results.push(existingForm.append($('<div class="alert alert-danger"></div>').text(error.message)));
    }
    return results;
  } else {
    res = errorModalTemplate({
      status: jqxhr.status,
      statusText: jqxhr.statusText,
      message: message
    });
    return showErrorModal(res);
  }
};

module.exports.backboneFailure = function(model, jqxhr, options) {
  return module.exports.genericFailure(jqxhr);
};

module.exports.connectionFailure = connectionFailure = function() {
  var html;
  html = errorModalTemplate({
    status: 0,
    statusText: 'Connection Gone',
    message: 'No response from the CoCo servers, captain.'
  });
  return showErrorModal(html);
};

module.exports.showNotyNetworkError = function() {
  var jqxhr, ref, ref1;
  jqxhr = _.find(arguments, 'promise');
  return noty({
    text: ((ref = jqxhr.responseJSON) != null ? ref.message : void 0) || ((ref1 = jqxhr.responseJSON) != null ? ref1.errorName : void 0) || 'Unknown error',
    layout: 'topCenter',
    type: 'error',
    timeout: 5000,
    killer: false,
    dismissQueue: true
  });
};

showErrorModal = function(html) {
  $('#modal-wrapper').html(html);
  $('.modal:visible').modal('hide');
  return $('#modal-error').modal('show');
};
});

;require.register("core/forms", function(exports, require, module) {
var setErrorToField, setErrorToProperty;

module.exports.formToObject = function($el, options) {
  var input, inputs, j, len, name, obj, value;
  options = _.extend({
    trim: true,
    ignoreEmptyString: true
  }, options);
  obj = {};
  inputs = $('input, textarea, select', $el);
  for (j = 0, len = inputs.length; j < len; j++) {
    input = inputs[j];
    input = $(input);
    if (!(name = input.attr('name'))) {
      continue;
    }
    if (input.attr('type') === 'checkbox') {
      if (obj[name] == null) {
        obj[name] = [];
      }
      if (input.is(':checked')) {
        obj[name].push(input.val());
      }
    } else if (input.attr('type') === 'radio') {
      if (!input.is('checked')) {
        continue;
      }
      obj[name] = input.val();
    } else {
      value = input.val() || '';
      if (options.trim) {
        value = _.string.trim(value);
      }
      if (value || (!options.ignoreEmptyString)) {
        obj[name] = value;
      }
    }
  }
  return obj;
};

module.exports.objectToForm = function($el, obj, options) {
  var input, inputs, j, len, name, results, value;
  if (options == null) {
    options = {};
  }
  options = _.extend({
    overwriteExisting: false
  }, options);
  inputs = $('input, textarea, select', $el);
  results = [];
  for (j = 0, len = inputs.length; j < len; j++) {
    input = inputs[j];
    input = $(input);
    if (!(name = input.attr('name'))) {
      continue;
    }
    if (obj[name] == null) {
      continue;
    }
    if (input.attr('type') === 'checkbox') {
      value = input.val();
      if (_.contains(obj[name], value)) {
        results.push(input.attr('checked', true));
      } else {
        results.push(void 0);
      }
    } else if (input.attr('type') === 'radio') {
      value = input.val();
      if (obj[name] === value) {
        results.push(input.attr('checked', true));
      } else {
        results.push(void 0);
      }
    } else {
      if (options.overwriteExisting || (!input.val())) {
        results.push(input.val(obj[name]));
      } else {
        results.push(void 0);
      }
    }
  }
  return results;
};

module.exports.applyErrorsToForm = function(el, errors, warning) {
  var error, j, len, message, missingErrors, originalMessage, prop;
  if (warning == null) {
    warning = false;
  }
  if (!$.isArray(errors)) {
    errors = [errors];
  }
  missingErrors = [];
  for (j = 0, len = errors.length; j < len; j++) {
    error = errors[j];
    if (error.code === tv4.errorCodes.OBJECT_REQUIRED) {
      prop = _.last(_.string.words(error.message));
      message = $.i18n.t('common.required_field');
    } else if (error.dataPath) {
      prop = error.dataPath.slice(1);
      message = error.message;
    } else {
      message = error.property + " " + error.message + ".";
      message = message[0].toUpperCase() + message.slice(1);
      if (error.formatted) {
        message = error.message;
      }
      prop = error.property;
    }
    if (error.code === tv4.errorCodes.FORMAT_CUSTOM) {
      originalMessage = /Format validation failed \(([^\(\)]+)\)/.exec(message)[1];
      if (!_.isEmpty(originalMessage)) {
        message = originalMessage;
      }
    }
    if (error.code === 409 && error.property === 'email') {
      message += ' <a class="login-link">Log in?</a>';
    }
    if (!setErrorToProperty(el, prop, message, warning)) {
      missingErrors.push(error);
    }
  }
  return missingErrors;
};

module.exports.setErrorToField = setErrorToField = function(el, message, warning) {
  var afterEl, formGroup, helpBlock, kind;
  if (warning == null) {
    warning = false;
  }
  formGroup = el.closest('.form-group');
  if (!formGroup.length) {
    return console.error(el, " did not contain a form group, so couldn't show message:", message);
  }
  kind = warning ? 'warning' : 'error';
  afterEl = $(formGroup.find('.help-block, .form-control, input, select, textarea')[0]);
  formGroup.addClass("has-" + kind);
  helpBlock = $("<span class='help-block " + kind + "-help-block'>" + message + "</span>");
  if (afterEl.length) {
    return afterEl.before(helpBlock);
  } else {
    return formGroup.append(helpBlock);
  }
};

module.exports.setErrorToProperty = setErrorToProperty = function(el, property, message, warning) {
  var input;
  if (warning == null) {
    warning = false;
  }
  input = $("[name='" + property + "']", el);
  if (!input.length) {
    return console.error(property + " not found in", el, "so couldn't show message:", message);
  }
  return setErrorToField(input, message, warning);
};

module.exports.scrollToFirstError = function($el) {
  var $first;
  if ($el == null) {
    $el = $('body');
  }
  $first = $el.find('.has-error, .alert-danger, .error-help-block, .has-warning, .alert-warning, .warning-help-block').filter(':visible').first();
  if ($first.length) {
    return $('html, body').animate({
      scrollTop: $first.offset().top - 20
    }, 300);
  }
};

module.exports.clearFormAlerts = function(el) {
  $('.has-error', el).removeClass('has-error');
  $('.has-warning', el).removeClass('has-warning');
  $('.alert.alert-danger', el).remove();
  $('.alert.alert-warning', el).remove();
  el.find('.help-block.error-help-block').remove();
  return el.find('.help-block.warning-help-block').remove();
};

module.exports.updateSelects = function(el) {
  return el.find('select').each(function(i, select) {
    var value;
    value = $(select).attr('value');
    return $(select).val(value);
  });
};

module.exports.validateEmail = function(email) {
  var filter;
  filter = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}$/i;
  return filter.test(email);
};

module.exports.disableSubmit = function(el, message) {
  var $el;
  if (message == null) {
    message = '...';
  }
  $el = $(el);
  $el.data('original-text', $el.text());
  return $el.text(message).attr('disabled', true);
};

module.exports.enableSubmit = function(el) {
  var $el;
  $el = $(el);
  return $el.text($el.data('original-text')).attr('disabled', false);
};
});

;require.register("core/initialize", function(exports, require, module) {
var app, channelSchemas, definitionSchemas, handleNormalUrls, init, loadOfflineFonts, seen, serializeForIOS, setUpBackboneMediator, setUpIOSLogging, setUpMoment, setupConsoleLogging, watchForErrors,
  slice = [].slice,
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Backbone.Mediator.setValidationEnabled(false);

app = null;

channelSchemas = {
  'auth': require('schemas/subscriptions/auth'),
  'bus': require('schemas/subscriptions/bus'),
  'editor': require('schemas/subscriptions/editor'),
  'errors': require('schemas/subscriptions/errors'),
  'ipad': require('schemas/subscriptions/ipad'),
  'misc': require('schemas/subscriptions/misc'),
  'play': require('schemas/subscriptions/play'),
  'surface': require('schemas/subscriptions/surface'),
  'tome': require('schemas/subscriptions/tome'),
  'god': require('schemas/subscriptions/god'),
  'scripts': require('schemas/subscriptions/scripts'),
  'web-dev': require('schemas/subscriptions/web-dev'),
  'world': require('schemas/subscriptions/world')
};

definitionSchemas = {
  'bus': require('schemas/definitions/bus'),
  'misc': require('schemas/definitions/misc')
};

init = function() {
  var path;
  if (app) {
    return;
  }
  if (!window.userObject._id) {
    $.ajax('/auth/whoami', {
      cache: false,
      success: function(res) {
        window.userObject = res;
        return init();
      }
    });
    return;
  }
  app = require('core/application');
  setupConsoleLogging();
  watchForErrors();
  setUpIOSLogging();
  path = document.location.pathname;
  app.testing = _.string.startsWith(path, '/test');
  app.demoing = _.string.startsWith(path, '/demo');
  setUpBackboneMediator();
  app.initialize();
  if (!app.isProduction()) {
    loadOfflineFonts();
  }
  Backbone.history.start({
    pushState: true
  });
  handleNormalUrls();
  return setUpMoment();
};

module.exports.init = init;

handleNormalUrls = function() {
  return $(document).on('click', "a[href^='/']", function(event) {
    var href, passThrough, url;
    href = $(event.currentTarget).attr('href');
    passThrough = href.indexOf('sign_out') >= 0;
    if (!passThrough && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      event.preventDefault();
      url = href.replace(/^\//, '').replace('\#\!\/', '');
      app.router.navigate(url, {
        trigger: true
      });
      return false;
    }
  });
};

setUpBackboneMediator = function() {
  var channel, definition, originalPublish, schemas;
  for (definition in definitionSchemas) {
    schemas = definitionSchemas[definition];
    Backbone.Mediator.addDefSchemas(schemas);
  }
  for (channel in channelSchemas) {
    schemas = channelSchemas[channel];
    Backbone.Mediator.addChannelSchemas(schemas);
  }
  Backbone.Mediator.setValidationEnabled(document.location.href.search(/codecombat.com/) === -1);
  if (false) {
    originalPublish = Backbone.Mediator.publish;
    return Backbone.Mediator.publish = function() {
      if (!/(tick|frame-changed)/.test(arguments[0])) {
        console.log.apply(console, ['Publishing event:'].concat(slice.call(arguments)));
      }
      return originalPublish.apply(Backbone.Mediator, arguments);
    };
  }
};

setUpMoment = function() {
  var me;
  me = require('core/auth').me;
  moment.lang(me.get('preferredLanguage', true), {});
  return me.on('change:preferredLanguage', function(me) {
    return moment.lang(me.get('preferredLanguage', true), {});
  });
};

setupConsoleLogging = function() {
  if (typeof console === "undefined" || console === null) {
    window.console = {
      info: function() {},
      log: function() {},
      error: function() {},
      debug: function() {}
    };
  }
  if (!console.debug) {
    return console.debug = console.log;
  }
};

watchForErrors = function() {
  var currentErrors;
  currentErrors = 0;
  return window.onerror = function(msg, url, line, col, error) {
    var message;
    if (currentErrors >= 3) {
      return;
    }
    if (!(me.isAdmin() || document.location.href.search(/codecombat.com/) === -1 || document.location.href.search(/\/editor\//) !== -1)) {
      return;
    }
    ++currentErrors;
    message = "Error: " + msg + "<br>Check the JS console for more.";
    if (!(typeof webkit !== "undefined" && webkit !== null ? webkit.messageHandlers : void 0)) {
      noty({
        text: message,
        layout: 'topCenter',
        type: 'error',
        killer: false,
        timeout: 5000,
        dismissQueue: true,
        maxVisible: 3,
        callback: {
          onClose: function() {
            return --currentErrors;
          }
        }
      });
    }
    return Backbone.Mediator.publish('application:error', {
      message: "Line " + line + " of " + url + ":\n" + msg
    });
  };
};

window.addIPadSubscription = function(channel) {
  return window.iPadSubscriptions[channel] = true;
};

window.removeIPadSubscription = function(channel) {
  return window.iPadSubscriptions[channel] = false;
};

setUpIOSLogging = function() {
  var i, len, level, ref, results;
  if (!(typeof webkit !== "undefined" && webkit !== null ? webkit.messageHandlers : void 0)) {
    return;
  }
  ref = ['debug', 'log', 'info', 'warn', 'error'];
  results = [];
  for (i = 0, len = ref.length; i < len; i++) {
    level = ref[i];
    results.push((function(level) {
      var originalLog;
      originalLog = console[level];
      return console[level] = function() {
        var a, e, error1, ref1, ref2, ref3, ref4;
        originalLog.apply(console, arguments);
        try {
          return typeof webkit !== "undefined" && webkit !== null ? (ref1 = webkit.messageHandlers) != null ? (ref2 = ref1.consoleLogHandler) != null ? ref2.postMessage({
            level: level,
            "arguments": (function() {
              var j, len1, ref3, results1;
              results1 = [];
              for (j = 0, len1 = arguments.length; j < len1; j++) {
                a = arguments[j];
                results1.push((ref3 = a != null ? typeof a.toString === "function" ? a.toString() : void 0 : void 0) != null ? ref3 : '' + a);
              }
              return results1;
            }).apply(this, arguments)
          }) : void 0 : void 0 : void 0;
        } catch (error1) {
          e = error1;
          return typeof webkit !== "undefined" && webkit !== null ? (ref3 = webkit.messageHandlers) != null ? (ref4 = ref3.consoleLogHandler) != null ? ref4.postMessage({
            level: level,
            "arguments": ['could not post log: ' + e]
          }) : void 0 : void 0 : void 0;
        }
      };
    })(level));
  }
  return results;
};

loadOfflineFonts = function() {
  $('head').prepend('<link rel="stylesheet" type="text/css" href="/fonts/openSansCondensed.css">');
  return $('head').prepend('<link rel="stylesheet" type="text/css" href="/fonts/openSans.css">');
};

seen = null;

window.serializeForIOS = serializeForIOS = function(obj, depth) {
  var child, clone, key, keysHandled, root, value;
  if (depth == null) {
    depth = 3;
  }
  if (!depth) {
    return {};
  }
  root = seen == null;
  if (seen == null) {
    seen = [];
  }
  clone = {};
  keysHandled = 0;
  for (key in obj) {
    if (!hasProp.call(obj, key)) continue;
    value = obj[key];
    if (++keysHandled > 50) {
      continue;
    }
    if (!value) {
      clone[key] = value;
    } else if (value === window || value.firstElementChild || value.preventDefault) {
      null;
    } else if (indexOf.call(seen, value) >= 0) {
      null;
    } else if (_.isArray(value)) {
      clone[key] = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = value.length; i < len; i++) {
          child = value[i];
          results.push(serializeForIOS(child, depth - 1));
        }
        return results;
      })();
      seen.push(value);
    } else if (_.isObject(value)) {
      if (value.id && value.attributes) {
        value = value.attributes;
      }
      clone[key] = serializeForIOS(value, depth - 1);
      seen.push(value);
    } else {
      clone[key] = value;
    }
  }
  if (root) {
    seen = null;
  }
  return clone;
};

window.onbeforeunload = function(e) {
  var leavingMessage;
  leavingMessage = _.result(window.currentView, 'onLeaveMessage');
  if (leavingMessage) {
    return leavingMessage;
  } else {

  }
};

$(function() {
  return init();
});
});

;require.register("core/services/algolia", function(exports, require, module) {
var client;

client = algoliasearch("JJM5H2CHJR", "50382fc2f7fa69c67e8233ace7cd7c4c");

module.exports = {
  client: client,
  schoolsIndex: client.initIndex('schools')
};
});

;require.register("core/services/filepicker", function(exports, require, module) {
var initializeFilepicker;

module.exports = initializeFilepicker = function() {
  return (function(a) {
    var b, c, d, e, f, g;
    if (window.filepicker) {
      return;
    }
    b = a.createElement('script');
    b.type = 'text/javascript';
    b.async = !0;
    b.src = ('https:' === a.location.protocol ? 'https:' : 'http:') + '//api.filepicker.io/v1/filepicker.js';
    c = a.getElementsByTagName('script')[0];
    c.parentNode.insertBefore(b, c);
    d = {};
    d._queue = [];
    e = 'pick,pickMultiple,pickAndStore,read,write,writeUrl,export,convert,store,storeUrl,remove,stat,setKey,constructWidget,makeDropPane'.split(',');
    f = function(a, b) {
      return function() {
        b.push([a, arguments]);
      };
    };
    g = 0;
    while (g < e.length) {
      d[e[g]] = f(e[g], d._queue);
      g++;
    }
    d.setKey('AvlkNoldcTOU4PvKi2Xm7z');
    window.filepicker = d;
  })(document);
};
});

;require.register("core/services/segment", function(exports, require, module) {
var initializeSegmentio;

module.exports = initializeSegmentio = function() {
  var analytics, i, len, method, ref;
  analytics = window.analytics = window.analytics || [];
  if (analytics.initialize) {
    return;
  }
  if (analytics.invoked) {
    return typeof console !== "undefined" && console !== null ? console.error('Segment snippet included twice.') : void 0;
  }
  analytics.invoked = true;
  analytics.methods = ['trackSubmit', 'trackClick', 'trackLink', 'trackForm', 'pageview', 'identify', 'reset', 'group', 'track', 'ready', 'alias', 'page', 'once', 'off', 'on'];
  analytics.factory = function(t) {
    return function() {
      var e;
      e = Array.prototype.slice.call(arguments);
      e.unshift(t);
      analytics.push(e);
      return analytics;
    };
  };
  ref = analytics.methods;
  for (i = 0, len = ref.length; i < len; i++) {
    method = ref[i];
    analytics[method] = analytics.factory(method);
  }
  analytics.load = function(t) {
    var e, n;
    e = document.createElement('script');
    e.type = 'text/javascript';
    e.async = true;
    e.src = (document.location.protocol === 'https:' ? 'https://' : 'http://') + 'cdn.segment.com/analytics.js/v1/' + t + '/analytics.min.js';
    n = document.getElementsByTagName('script')[0];
    n.parentNode.insertBefore(e, n);
    Backbone.Mediator.publish('application:service-loaded', {
      service: 'segment'
    });
  };
  analytics.SNIPPET_VERSION = '3.1.0';
  return analytics.load('yJpJZWBw68fEj0aPSv8ffMMgof5kFnU9');
};
});

;require.register("core/services/stripe", function(exports, require, module) {
var handler, publishableKey;

publishableKey = application.isProduction() ? 'pk_live_27jQZozjDGN1HSUTnSuM578g' : 'pk_test_zG5UwVu6Ww8YhtE9ZYh0JO6a';

if (me.isAnonymous()) {
  module.exports = {};
} else if (typeof StripeCheckout === "undefined" || StripeCheckout === null) {
  module.exports = {};
  console.error("Failure loading StripeCheckout API, returning empty object.");
} else {
  module.exports = handler = StripeCheckout.configure({
    key: publishableKey,
    name: 'CodeCombat',
    email: me.get('email'),
    image: "https://codecombat.com/images/pages/base/logo_square_250.png",
    token: function(token) {
      handler.trigger('received-token', {
        token: token
      });
      return Backbone.Mediator.publish('stripe:received-token', {
        token: token
      });
    },
    locale: 'auto'
  });
  _.extend(handler, Backbone.Events);
}
});

;require.register("core/services/twitter", function(exports, require, module) {
var initializeTwitter;

module.exports = initializeTwitter = function() {
  return (function(d, s, id) {
    var fjs, js, p;
    js = void 0;
    fjs = d.getElementsByTagName(s)[0];
    p = (/^http:/.test(d.location) ? 'http' : 'https');
    if (!d.getElementById(id)) {
      js = d.createElement(s);
      js.id = id;
      js.src = p + '://platform.twitter.com/widgets.js';
      fjs.parentNode.insertBefore(js, fjs);
    }
  })(document, 'script', 'twitter-wjs');
};
});

;require.register("core/social-handlers/FacebookHandler", function(exports, require, module) {
var CocoClass, FacebookHandler, backboneFailure, me, storage, userPropsToSave,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoClass = require('core/CocoClass');

me = require('core/auth').me;

backboneFailure = require('core/errors').backboneFailure;

storage = require('core/storage');

userPropsToSave = {
  'first_name': 'firstName',
  'last_name': 'lastName',
  'gender': 'gender',
  'email': 'email',
  'id': 'facebookID'
};

module.exports = FacebookHandler = FacebookHandler = (function(superClass) {
  extend(FacebookHandler, superClass);

  function FacebookHandler() {
    return FacebookHandler.__super__.constructor.apply(this, arguments);
  }

  FacebookHandler.prototype.token = function() {
    var ref1;
    return (ref1 = this.authResponse) != null ? ref1.accessToken : void 0;
  };

  FacebookHandler.prototype.startedLoading = false;

  FacebookHandler.prototype.apiLoaded = false;

  FacebookHandler.prototype.connected = false;

  FacebookHandler.prototype.person = null;

  FacebookHandler.prototype.fakeAPI = function() {
    window.FB = {
      login: function(cb, options) {
        return cb({
          status: 'connected',
          authResponse: {
            accessToken: '1234'
          }
        });
      },
      api: function(url, options, cb) {
        return cb({
          first_name: 'Mr',
          last_name: 'Bean',
          id: 'abcd',
          email: 'some@email.com'
        });
      }
    };
    this.startedLoading = true;
    return this.apiLoaded = true;
  };

  FacebookHandler.prototype.loadAPI = function(options) {
    if (options == null) {
      options = {};
    }
    if (options.success == null) {
      options.success = _.noop;
    }
    if (options.context == null) {
      options.context = options;
    }
    if (this.apiLoaded) {
      options.success.bind(options.context)();
    } else {
      this.once('load-api', options.success, options.context);
    }
    if (!this.startedLoading) {
      this.startedLoading = true;
      (function(d) {
        var id, js, ref;
        js = void 0;
        id = 'facebook-jssdk';
        ref = d.getElementsByTagName('script')[0];
        if (d.getElementById(id)) {
          return;
        }
        js = d.createElement('script');
        js.id = id;
        js.async = true;
        js.src = '//connect.facebook.net/en_US/sdk.js';
        ref.parentNode.insertBefore(js, ref);
      })(document);
      return window.fbAsyncInit = (function(_this) {
        return function() {
          FB.init({
            appId: (document.location.origin === 'http://localhost:3000' ? '607435142676437' : '148832601965463'),
            channelUrl: document.location.origin + '/channel.html',
            cookie: true,
            xfbml: true,
            version: 'v2.7'
          });
          return FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
              _this.connected = true;
              _this.authResponse = response.authResponse;
              _this.trigger('connect', {
                response: response
              });
            }
            _this.apiLoaded = true;
            return _this.trigger('load-api');
          });
        };
      })(this);
    }
  };

  FacebookHandler.prototype.connect = function(options) {
    if (options == null) {
      options = {};
    }
    if (options.success == null) {
      options.success = _.noop;
    }
    if (options.context == null) {
      options.context = options;
    }
    return FB.login(((function(_this) {
      return function(response) {
        if (response.status === 'connected') {
          _this.connected = true;
          _this.authResponse = response.authResponse;
          _this.trigger('connect', {
            response: response
          });
          return options.success.bind(options.context)();
        }
      };
    })(this)), {
      scope: 'email'
    });
  };

  FacebookHandler.prototype.loadPerson = function(options) {
    if (options == null) {
      options = {};
    }
    if (options.success == null) {
      options.success = _.noop;
    }
    if (options.context == null) {
      options.context = options;
    }
    return FB.api('/me', {
      fields: 'email,last_name,first_name,gender'
    }, (function(_this) {
      return function(person) {
        var attrs, fbProp, userProp, value;
        attrs = {};
        for (fbProp in userPropsToSave) {
          userProp = userPropsToSave[fbProp];
          value = person[fbProp];
          if (value) {
            attrs[userProp] = value;
          }
        }
        _this.trigger('load-person', attrs);
        return options.success.bind(options.context)(attrs);
      };
    })(this));
  };

  FacebookHandler.prototype.renderButtons = function() {
    var ref1;
    if (typeof FB !== "undefined" && FB !== null ? (ref1 = FB.XFBML) != null ? ref1.parse : void 0 : void 0) {
      return setTimeout(FB.XFBML.parse, 10);
    }
  };

  return FacebookHandler;

})(CocoClass);
});

;require.register("core/social-handlers/GPlusHandler", function(exports, require, module) {
var CocoClass, GPLUS_TOKEN_KEY, GPlusHandler, backboneFailure, clientID, fieldsToFetch, me, plusURL, revokeUrl, scope, storage, userPropsToSave,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoClass = require('core/CocoClass');

me = require('core/auth').me;

backboneFailure = require('core/errors').backboneFailure;

storage = require('core/storage');

GPLUS_TOKEN_KEY = 'gplusToken';

userPropsToSave = {
  'name.givenName': 'firstName',
  'name.familyName': 'lastName',
  'gender': 'gender',
  'id': 'gplusID'
};

fieldsToFetch = 'displayName,gender,image,name(familyName,givenName),id';

plusURL = '/plus/v1/people/me?fields=' + fieldsToFetch;

revokeUrl = 'https://accounts.google.com/o/oauth2/revoke?token=';

clientID = '800329290710-j9sivplv2gpcdgkrsis9rff3o417mlfa.apps.googleusercontent.com';

scope = 'https://www.googleapis.com/auth/plus.login email';

module.exports = GPlusHandler = GPlusHandler = (function(superClass) {
  extend(GPlusHandler, superClass);

  function GPlusHandler() {
    this.accessToken = storage.load(GPLUS_TOKEN_KEY, false);
    GPlusHandler.__super__.constructor.call(this);
  }

  GPlusHandler.prototype.token = function() {
    var ref;
    return (ref = this.accessToken) != null ? ref.access_token : void 0;
  };

  GPlusHandler.prototype.startedLoading = false;

  GPlusHandler.prototype.apiLoaded = false;

  GPlusHandler.prototype.connected = false;

  GPlusHandler.prototype.person = null;

  GPlusHandler.prototype.fakeAPI = function() {
    window.gapi = {
      client: {
        load: function(api, version, cb) {
          return cb();
        },
        plus: {
          people: {
            get: function() {
              return {
                execute: function(cb) {
                  return cb({
                    name: {
                      givenName: 'Mr',
                      familyName: 'Bean'
                    },
                    id: 'abcd',
                    emails: [
                      {
                        value: 'some@email.com'
                      }
                    ]
                  });
                }
              };
            }
          }
        }
      },
      auth: {
        authorize: function(opts, cb) {
          return cb({
            access_token: '1234'
          });
        }
      }
    };
    this.startedLoading = true;
    return this.apiLoaded = true;
  };

  GPlusHandler.prototype.fakeConnect = function() {
    this.accessToken = {
      access_token: '1234'
    };
    return this.trigger('connect');
  };

  GPlusHandler.prototype.loadAPI = function(options) {
    var po, s;
    if (options == null) {
      options = {};
    }
    if (options.success == null) {
      options.success = _.noop;
    }
    if (options.context == null) {
      options.context = options;
    }
    if (this.apiLoaded) {
      options.success.bind(options.context)();
    } else {
      this.once('load-api', options.success, options.context);
    }
    if (!this.startedLoading) {
      po = document.createElement('script');
      po.type = 'text/javascript';
      po.async = true;
      po.src = 'https://apis.google.com/js/client:platform.js?onload=onGPlusLoaded';
      s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(po, s);
      this.startedLoading = true;
      return window.onGPlusLoaded = (function(_this) {
        return function() {
          var session_state;
          _this.apiLoaded = true;
          if (_this.accessToken && me.get('gplusID')) {
            gapi.auth.setToken('token', _this.accessToken);
            session_state = _this.accessToken.session_state;
            return gapi.auth.checkSessionState({
              client_id: clientID,
              session_state: session_state
            }, function(connected) {
              _this.connected = connected;
              return _this.trigger('load-api');
            });
          } else {
            _this.connected = false;
            return _this.trigger('load-api');
          }
        };
      })(this);
    }
  };

  GPlusHandler.prototype.connect = function(options) {
    var authOptions;
    if (options == null) {
      options = {};
    }
    if (options.success == null) {
      options.success = _.noop;
    }
    if (options.context == null) {
      options.context = options;
    }
    authOptions = {
      client_id: clientID,
      scope: 'https://www.googleapis.com/auth/plus.login email'
    };
    return gapi.auth.authorize(authOptions, (function(_this) {
      return function(e) {
        var d, error;
        if (!e.access_token) {
          return;
        }
        _this.connected = true;
        try {
          d = _.omit(e, 'g-oauth-window');
          storage.save(GPLUS_TOKEN_KEY, d, 0);
        } catch (error) {
          e = error;
          console.error('Unable to save G+ token key', e);
        }
        _this.accessToken = e;
        _this.trigger('connect');
        return options.success.bind(options.context)();
      };
    })(this));
  };

  GPlusHandler.prototype.loadPerson = function(options) {
    if (options == null) {
      options = {};
    }
    if (options.success == null) {
      options.success = _.noop;
    }
    if (options.context == null) {
      options.context = options;
    }
    return gapi.client.load('plus', 'v1', (function(_this) {
      return function() {
        return gapi.client.plus.people.get({
          userId: 'me'
        }).execute(function(r) {
          var attrs, gpProp, i, key, keys, len, ref, userProp, value;
          attrs = {};
          for (gpProp in userPropsToSave) {
            userProp = userPropsToSave[gpProp];
            keys = gpProp.split('.');
            value = r;
            for (i = 0, len = keys.length; i < len; i++) {
              key = keys[i];
              value = value[key];
            }
            if (value) {
              attrs[userProp] = value;
            }
          }
          if ((ref = r.emails) != null ? ref.length : void 0) {
            attrs.email = r.emails[0].value;
          }
          _this.trigger('load-person', attrs);
          return options.success.bind(options.context)(attrs);
        });
      };
    })(this));
  };

  GPlusHandler.prototype.renderButtons = function() {
    var base;
    if ((typeof gapi !== "undefined" && gapi !== null ? gapi.plusone : void 0) == null) {
      return false;
    }
    return typeof (base = gapi.plusone).go === "function" ? base.go() : void 0;
  };

  GPlusHandler.prototype.loadFriends = function(friendsCallback) {
    var expiresIn, onReauthorized;
    if (!this.loggedIn) {
      return friendsCallback();
    }
    expiresIn = this.accessToken ? parseInt(this.accessToken.expires_at) - new Date().getTime() / 1000 : -1;
    onReauthorized = (function(_this) {
      return function() {
        return gapi.client.request({
          path: '/plus/v1/people/me/people/visible',
          callback: friendsCallback
        });
      };
    })(this);
    if (expiresIn < 0) {
      this.reauthorize();
      return this.listenToOnce(this, 'logged-in', onReauthorized);
    } else {
      return onReauthorized();
    }
  };

  GPlusHandler.prototype.reauthorize = function() {
    var params;
    params = {
      'client_id': clientID,
      'scope': scope
    };
    return gapi.auth.authorize(params, this.onGPlusLogin);
  };

  return GPlusHandler;

})(CocoClass);
});

;require.register("core/social-handlers/GitHubHandler", function(exports, require, module) {
var CocoClass, GitHubHandler, me, storage,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoClass = require('core/CocoClass');

me = require('core/auth').me;

storage = require('core/storage');

module.exports = GitHubHandler = (function(superClass) {
  extend(GitHubHandler, superClass);

  GitHubHandler.prototype.scopes = 'user:email';

  GitHubHandler.prototype.subscriptions = {
    'auth:log-in-with-github': 'commenceGitHubLogin'
  };

  function GitHubHandler() {
    GitHubHandler.__super__.constructor.apply(this, arguments);
    this.clientID = application.isProduction() ? '9b405bf5fb84590d1f02' : 'fd5c9d34eb171131bc87';
    this.redirectURI = application.isProduction() ? 'http://codecombat.com/github/auth_callback' : 'http://localhost:3000/github/auth_callback';
  }

  GitHubHandler.prototype.commenceGitHubLogin = function(e) {
    var request;
    request = {
      scope: this.scopes,
      client_id: this.clientID,
      redirect_uri: this.redirectURI
    };
    return location.href = "https://github.com/login/oauth/authorize?" + $.param(request);
  };

  return GitHubHandler;

})(CocoClass);
});

;require.register("core/storage", function(exports, require, module) {
module.exports.load = function(key, fromCache) {
  var SyntaxError, error, s, value;
  if (fromCache == null) {
    fromCache = true;
  }
  if (fromCache) {
    return lscache.get(key);
  }
  s = localStorage.getItem(key);
  if (!s) {
    return null;
  }
  try {
    value = JSON.parse(s);
    return value;
  } catch (error) {
    SyntaxError = error;
    console.warn('error loading from storage', key);
    return null;
  }
};

module.exports.save = function(key, value, expirationInMinutes) {
  if (expirationInMinutes == null) {
    expirationInMinutes = 7 * 24 * 60;
  }
  if (expirationInMinutes) {
    return lscache.set(key, value, expirationInMinutes);
  } else {
    return localStorage.setItem(key, JSON.stringify(value));
  }
};

module.exports.remove = function(key, fromCache) {
  if (fromCache == null) {
    fromCache = true;
  }
  if (fromCache) {
    return lscache.remove(key);
  } else {
    return localStorage.removeItem(key);
  }
};
});

;require.register("core/treema-ext", function(exports, require, module) {
var CocoCollection, CocoModel, CodeLanguageTreema, CodeLanguagesObjectTreema, CodeTreema, CoffeeTreema, DateTimeTreema, IDReferenceNode, ImageFileTreema, InternationalizationNode, JavaScriptTreema, LatestVersionCollection, LatestVersionOriginalReferenceNode, LatestVersionReferenceNode, LevelComponentReferenceNode, LiveEditingMarkup, SlugPropsObject, SoundFileTreema, TaskTreema, VersionTreema, initializeFilePicker, locale, me, utils,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

CocoModel = require('models/CocoModel');

CocoCollection = require('collections/CocoCollection');

me = require('core/auth').me;

locale = require('locale/locale');

utils = require('core/utils');

initializeFilePicker = function() {
  if (!window.application.isIPadApp) {
    return require('core/services/filepicker')();
  }
};

DateTimeTreema = (function(superClass) {
  extend(DateTimeTreema, superClass);

  function DateTimeTreema() {
    return DateTimeTreema.__super__.constructor.apply(this, arguments);
  }

  DateTimeTreema.prototype.valueClass = 'treema-date-time';

  DateTimeTreema.prototype.buildValueForDisplay = function(el, data) {
    return el.text(moment(data).format('llll'));
  };

  DateTimeTreema.prototype.buildValueForEditing = function(valEl) {
    return this.buildValueForEditingSimply(valEl, null, 'date');
  };

  return DateTimeTreema;

})(TreemaNode.nodeMap.string);

VersionTreema = (function(superClass) {
  extend(VersionTreema, superClass);

  function VersionTreema() {
    return VersionTreema.__super__.constructor.apply(this, arguments);
  }

  VersionTreema.prototype.valueClass = 'treema-version';

  VersionTreema.prototype.buildValueForDisplay = function(valEl, data) {
    return this.buildValueForDisplaySimply(valEl, data.major + "." + data.minor);
  };

  return VersionTreema;

})(TreemaNode);

LiveEditingMarkup = (function(superClass) {
  extend(LiveEditingMarkup, superClass);

  LiveEditingMarkup.prototype.valueClass = 'treema-markdown treema-multiline treema-ace';

  function LiveEditingMarkup() {
    this.togglePreview = bind(this.togglePreview, this);
    this.onFileUploaded = bind(this.onFileUploaded, this);
    this.onFileChosen = bind(this.onFileChosen, this);
    LiveEditingMarkup.__super__.constructor.apply(this, arguments);
    this.workingSchema.aceMode = 'ace/mode/markdown';
    initializeFilePicker();
  }

  LiveEditingMarkup.prototype.initEditor = function(valEl) {
    var buttonRow;
    buttonRow = $('<div class="buttons"></div>');
    valEl.append(buttonRow);
    this.addPreviewToggle(buttonRow);
    this.addImageUpload(buttonRow);
    LiveEditingMarkup.__super__.initEditor.call(this, valEl);
    return valEl.append($('<div class="preview"></div>').hide());
  };

  LiveEditingMarkup.prototype.addImageUpload = function(valEl) {
    if (!(me.isAdmin() || me.isArtisan())) {
      return;
    }
    return valEl.append($('<div class="pick-image-button"></div>').append($('<button>Pick Image</button>').addClass('btn btn-sm btn-primary').click((function(_this) {
      return function() {
        return filepicker.pick(_this.onFileChosen);
      };
    })(this))));
  };

  LiveEditingMarkup.prototype.addPreviewToggle = function(valEl) {
    return valEl.append($('<div class="toggle-preview-button"></div>').append($('<button>Toggle Preview</button>').addClass('btn btn-sm btn-primary').click(this.togglePreview)));
  };

  LiveEditingMarkup.prototype.onFileChosen = function(InkBlob) {
    var body;
    body = {
      url: InkBlob.url,
      filename: InkBlob.filename,
      mimetype: InkBlob.mimetype,
      path: this.settings.filePath,
      force: true
    };
    this.uploadingPath = [this.settings.filePath, InkBlob.filename].join('/');
    return $.ajax('/file', {
      type: 'POST',
      data: body,
      success: this.onFileUploaded
    });
  };

  LiveEditingMarkup.prototype.onFileUploaded = function(e) {
    return this.editor.insert("![" + e.metadata.name + "](/file/" + this.uploadingPath + ")");
  };

  LiveEditingMarkup.prototype.showingPreview = false;

  LiveEditingMarkup.prototype.togglePreview = function() {
    var valEl;
    valEl = this.getValEl();
    if (this.showingPreview) {
      valEl.find('.preview').hide();
      valEl.find('.pick-image-button').show();
      valEl.find('.ace_editor').show();
    } else {
      valEl.find('.preview').html(marked(this.data)).show();
      valEl.find('.pick-image-button').hide();
      valEl.find('.ace_editor').hide();
    }
    return this.showingPreview = !this.showingPreview;
  };

  return LiveEditingMarkup;

})(TreemaNode.nodeMap.ace);

SoundFileTreema = (function(superClass) {
  extend(SoundFileTreema, superClass);

  SoundFileTreema.prototype.valueClass = 'treema-sound-file';

  SoundFileTreema.prototype.editable = false;

  SoundFileTreema.prototype.soundCollection = 'files';

  function SoundFileTreema() {
    this.onFileUploaded = bind(this.onFileUploaded, this);
    this.onFileChosen = bind(this.onFileChosen, this);
    this.stopFile = bind(this.stopFile, this);
    this.playFile = bind(this.playFile, this);
    SoundFileTreema.__super__.constructor.apply(this, arguments);
    initializeFilePicker();
  }

  SoundFileTreema.prototype.onClick = function(e) {
    if ($(e.target).closest('.btn').length) {
      return;
    }
    return SoundFileTreema.__super__.onClick.apply(this, arguments);
  };

  SoundFileTreema.prototype.getFiles = function() {
    var ref;
    return ((ref = this.settings[this.soundCollection]) != null ? ref.models : void 0) || [];
  };

  SoundFileTreema.prototype.buildValueForDisplay = function(valEl, data) {
    var dropdown, dropdownButton, file, filename, files, fullPath, i, len, li, menu, mimetype, mimetypes, name, path, pickButton, playButton, ref, stopButton;
    mimetype = "audio/" + this.keyForParent;
    mimetypes = [mimetype];
    if (mimetype === 'audio/mp3') {
      mimetypes.push('audio/mpeg');
    } else if (mimetype === 'audio/ogg') {
      mimetypes.push('application/ogg');
      mimetypes.push('video/ogg');
    }
    pickButton = $('<a class="btn btn-primary btn-xs"><span class="glyphicon glyphicon-upload"></span></a>').click((function(_this) {
      return function() {
        return filepicker.pick({
          mimetypes: mimetypes
        }, _this.onFileChosen);
      };
    })(this));
    playButton = $('<a class="btn btn-primary btn-xs"><span class="glyphicon glyphicon-play"></span></a>').click(this.playFile);
    stopButton = $('<a class="btn btn-primary btn-xs"><span class="glyphicon glyphicon-stop"></span></a>').click(this.stopFile);
    dropdown = $('<div class="btn-group dropdown"></div>');
    dropdownButton = $('<a></a>').addClass('btn btn-primary btn-xs dropdown-toggle').attr('href', '#').append($('<span class="glyphicon glyphicon-chevron-down"></span>')).dropdown();
    dropdown.append(dropdownButton);
    menu = $('<div class="dropdown-menu"></div>');
    files = this.getFiles();
    for (i = 0, len = files.length; i < len; i++) {
      file = files[i];
      if (ref = file.get('contentType'), indexOf.call(mimetypes, ref) < 0) {
        continue;
      }
      path = file.get('metadata').path;
      filename = file.get('filename');
      fullPath = [path, filename].join('/');
      li = $('<li></li>').data('fullPath', fullPath).text(filename);
      menu.append(li);
    }
    menu.click((function(_this) {
      return function(e) {
        _this.data = $(e.target).data('fullPath') || data;
        return _this.reset();
      };
    })(this));
    dropdown.append(menu);
    valEl.append(pickButton);
    if (data) {
      valEl.append(playButton);
      valEl.append(stopButton);
    }
    valEl.append(dropdown);
    if (data) {
      path = data.split('/');
      name = path[path.length - 1];
      return valEl.append($('<span></span>').text(name));
    }
  };

  SoundFileTreema.prototype.reset = function() {
    this.instance = null;
    this.flushChanges();
    return this.refreshDisplay();
  };

  SoundFileTreema.prototype.playFile = function() {
    var f, registered;
    this.src = "/file/" + (this.getData());
    if (this.instance) {
      return this.instance.play();
    } else {
      createjs.Sound.alternateExtensions = ['mp3', 'ogg'];
      registered = createjs.Sound.registerSound(this.src);
      if (registered === true) {
        return this.instance = createjs.Sound.play(this.src);
      } else {
        f = (function(_this) {
          return function(event) {
            if (event.src === _this.src) {
              _this.instance = createjs.Sound.play(event.src);
            }
            return createjs.Sound.removeEventListener('fileload', f);
          };
        })(this);
        return createjs.Sound.addEventListener('fileload', f);
      }
    }
  };

  SoundFileTreema.prototype.stopFile = function() {
    var ref;
    return (ref = this.instance) != null ? ref.stop() : void 0;
  };

  SoundFileTreema.prototype.onFileChosen = function(InkBlob) {
    var body;
    if (!this.settings.filePath) {
      console.error('Need to specify a filePath for this treema', this.getRoot());
      throw Error('cannot upload file');
    }
    body = {
      url: InkBlob.url,
      filename: InkBlob.filename,
      mimetype: InkBlob.mimetype,
      path: this.settings.filePath,
      force: true
    };
    this.uploadingPath = [this.settings.filePath, InkBlob.filename].join('/');
    return $.ajax('/file', {
      type: 'POST',
      data: body,
      success: this.onFileUploaded
    });
  };

  SoundFileTreema.prototype.onFileUploaded = function(e) {
    this.data = this.uploadingPath;
    return this.reset();
  };

  return SoundFileTreema;

})(TreemaNode.nodeMap.string);

ImageFileTreema = (function(superClass) {
  extend(ImageFileTreema, superClass);

  ImageFileTreema.prototype.valueClass = 'treema-image-file';

  ImageFileTreema.prototype.editable = false;

  function ImageFileTreema() {
    this.onFileUploaded = bind(this.onFileUploaded, this);
    this.onFileChosen = bind(this.onFileChosen, this);
    ImageFileTreema.__super__.constructor.apply(this, arguments);
    initializeFilePicker();
  }

  ImageFileTreema.prototype.onClick = function(e) {
    if ($(e.target).closest('.btn').length) {
      return;
    }
    return ImageFileTreema.__super__.onClick.apply(this, arguments);
  };

  ImageFileTreema.prototype.buildValueForDisplay = function(valEl, data) {
    var mimetype, pickButton;
    mimetype = 'image/*';
    pickButton = $('<a class="btn btn-sm btn-primary"><span class="glyphicon glyphicon-upload"></span> Upload Picture</a>').click((function(_this) {
      return function() {
        return filepicker.pick({
          mimetypes: [mimetype]
        }, _this.onFileChosen);
      };
    })(this));
    valEl.append(pickButton);
    if (data) {
      return valEl.append($('<img />').attr('src', "/file/" + data));
    }
  };

  ImageFileTreema.prototype.onFileChosen = function(InkBlob) {
    var body;
    if (!this.settings.filePath) {
      console.error('Need to specify a filePath for this treema', this.getRoot());
      throw Error('cannot upload file');
    }
    body = {
      url: InkBlob.url,
      filename: InkBlob.filename,
      mimetype: InkBlob.mimetype,
      path: this.settings.filePath,
      force: true
    };
    this.uploadingPath = [this.settings.filePath, InkBlob.filename].join('/');
    return $.ajax('/file', {
      type: 'POST',
      data: body,
      success: this.onFileUploaded
    });
  };

  ImageFileTreema.prototype.onFileUploaded = function(e) {
    this.data = this.uploadingPath;
    this.flushChanges();
    return this.refreshDisplay();
  };

  return ImageFileTreema;

})(TreemaNode.nodeMap.string);

CodeLanguagesObjectTreema = (function(superClass) {
  extend(CodeLanguagesObjectTreema, superClass);

  function CodeLanguagesObjectTreema() {
    return CodeLanguagesObjectTreema.__super__.constructor.apply(this, arguments);
  }

  CodeLanguagesObjectTreema.prototype.childPropertiesAvailable = function() {
    var i, key, len, ref, results;
    ref = _.keys(utils.aceEditModes);
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      key = ref[i];
      if ((this.data[key] == null) && !(key === 'javascript' && this.workingSchema.skipJavaScript)) {
        results.push(key);
      }
    }
    return results;
  };

  return CodeLanguagesObjectTreema;

})(TreemaNode.nodeMap.object);

CodeLanguageTreema = (function(superClass) {
  extend(CodeLanguageTreema, superClass);

  function CodeLanguageTreema() {
    return CodeLanguageTreema.__super__.constructor.apply(this, arguments);
  }

  CodeLanguageTreema.prototype.buildValueForEditing = function(valEl, data) {
    CodeLanguageTreema.__super__.buildValueForEditing.call(this, valEl, data);
    valEl.find('input').autocomplete({
      source: _.keys(utils.aceEditModes),
      minLength: 0,
      delay: 0,
      autoFocus: true
    });
    return valEl;
  };

  return CodeLanguageTreema;

})(TreemaNode.nodeMap.string);

CodeTreema = (function(superClass) {
  extend(CodeTreema, superClass);

  function CodeTreema() {
    var mode, ref, ref1;
    CodeTreema.__super__.constructor.apply(this, arguments);
    this.workingSchema.aceTabSize = 4;
    if (mode = utils.aceEditModes[this.keyForParent]) {
      this.workingSchema.aceMode = mode;
    }
    if (mode = utils.aceEditModes[(ref = this.parent) != null ? (ref1 = ref.data) != null ? ref1.language : void 0 : void 0]) {
      this.workingSchema.aceMode = mode;
    }
  }

  return CodeTreema;

})(TreemaNode.nodeMap.ace);

CoffeeTreema = (function(superClass) {
  extend(CoffeeTreema, superClass);

  function CoffeeTreema() {
    CoffeeTreema.__super__.constructor.apply(this, arguments);
    this.workingSchema.aceMode = 'ace/mode/coffee';
    this.workingSchema.aceTabSize = 2;
  }

  return CoffeeTreema;

})(CodeTreema);

JavaScriptTreema = (function(superClass) {
  extend(JavaScriptTreema, superClass);

  function JavaScriptTreema() {
    JavaScriptTreema.__super__.constructor.apply(this, arguments);
    this.workingSchema.aceMode = 'ace/mode/javascript';
    this.workingSchema.aceTabSize = 4;
  }

  return JavaScriptTreema;

})(CodeTreema);

InternationalizationNode = (function(superClass) {
  extend(InternationalizationNode, superClass);

  function InternationalizationNode() {
    return InternationalizationNode.__super__.constructor.apply(this, arguments);
  }

  InternationalizationNode.prototype.findLanguageName = function(languageCode) {
    var ref;
    if (languageCode === '-') {
      return '';
    }
    return ((ref = locale[languageCode]) != null ? ref.nativeDescription : void 0) || (languageCode + " Not Found");
  };

  InternationalizationNode.prototype.getChildren = function() {
    var r, res;
    res = InternationalizationNode.__super__.getChildren.apply(this, arguments);
    res = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = res.length; i < len; i++) {
        r = res[i];
        if (r[0] !== '-') {
          results.push(r);
        }
      }
      return results;
    })();
    return res;
  };

  InternationalizationNode.prototype.populateData = function() {
    InternationalizationNode.__super__.populateData.call(this);
    if (Object.keys(this.data).length === 0) {
      return this.data['-'] = {
        '-': '-'
      };
    }
  };

  InternationalizationNode.prototype.getChildSchema = function(key) {
    var _, extraSchema, extraSchemas, i, i18nChildSchema, i18nProperty, j, k, len, len1, len2, parentSchemaProperties, prop, ref, ref1, ref2, ref3, ref4, ref5, schema;
    i18nChildSchema = {
      title: this.findLanguageName(key),
      type: 'object',
      properties: {}
    };
    if (!this.parent) {
      return i18nChildSchema;
    }
    if (this.workingSchema.props == null) {
      console.warn('i18n props array is empty! Filling with all parent properties by default');
      this.workingSchema.props = (function() {
        var ref, results;
        ref = this.parent.schema.properties;
        results = [];
        for (prop in ref) {
          _ = ref[prop];
          if (prop !== 'i18n') {
            results.push(prop);
          }
        }
        return results;
      }).call(this);
    }
    ref = this.workingSchema.props;
    for (i = 0, len = ref.length; i < len; i++) {
      i18nProperty = ref[i];
      parentSchemaProperties = (ref1 = this.parent.schema.properties) != null ? ref1 : {};
      ref2 = [this.parent.schema.oneOf, this.parent.schema.anyOf];
      for (j = 0, len1 = ref2.length; j < len1; j++) {
        extraSchemas = ref2[j];
        ref3 = extraSchemas != null ? extraSchemas : [];
        for (k = 0, len2 = ref3.length; k < len2; k++) {
          extraSchema = ref3[k];
          ref5 = (ref4 = extraSchema != null ? extraSchema.properties : void 0) != null ? ref4 : {};
          for (prop in ref5) {
            schema = ref5[prop];
            if (parentSchemaProperties[prop] == null) {
              parentSchemaProperties[prop] = schema;
            }
          }
        }
      }
      i18nChildSchema.properties[i18nProperty] = parentSchemaProperties[i18nProperty];
    }
    return i18nChildSchema;
  };

  InternationalizationNode.prototype.childPropertiesAvailable = function() {
    var i, key, len, ref, results;
    ref = _.keys(locale);
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      key = ref[i];
      if (this.data[key] == null) {
        results.push(key);
      }
    }
    return results;
  };

  return InternationalizationNode;

})(TreemaNode.nodeMap.object);

LatestVersionCollection = (function(superClass) {
  extend(LatestVersionCollection, superClass);

  function LatestVersionCollection() {
    return LatestVersionCollection.__super__.constructor.apply(this, arguments);
  }

  return LatestVersionCollection;

})(CocoCollection);

module.exports.LatestVersionReferenceNode = LatestVersionReferenceNode = (function(superClass) {
  extend(LatestVersionReferenceNode, superClass);

  LatestVersionReferenceNode.prototype.searchValueTemplate = '<input placeholder="Search" /><div class="treema-search-results"></div>';

  LatestVersionReferenceNode.prototype.valueClass = 'treema-latest-version';

  LatestVersionReferenceNode.prototype.url = '/db/article';

  LatestVersionReferenceNode.prototype.lastTerm = null;

  function LatestVersionReferenceNode() {
    this.search = bind(this.search, this);
    var l, link, links, p, parts;
    LatestVersionReferenceNode.__super__.constructor.apply(this, arguments);
    links = this.workingSchema.links || [];
    link = ((function() {
      var i, len, results;
      results = [];
      for (i = 0, len = links.length; i < len; i++) {
        l = links[i];
        if (l.rel === 'db') {
          results.push(l);
        }
      }
      return results;
    })())[0];
    if (!link) {
      return;
    }
    parts = (function() {
      var i, len, ref, results;
      ref = link.href.split('/');
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        p = ref[i];
        if (p.length) {
          results.push(p);
        }
      }
      return results;
    })();
    this.url = "/db/" + parts[1];
    this.model = require('models/' + _.string.classify(parts[1]));
  }

  LatestVersionReferenceNode.prototype.buildValueForDisplay = function(valEl, data) {
    var val;
    val = data ? this.formatDocument(data) : 'None';
    return this.buildValueForDisplaySimply(valEl, val);
  };

  LatestVersionReferenceNode.prototype.buildValueForEditing = function(valEl, data) {
    var input;
    valEl.html(this.searchValueTemplate);
    input = valEl.find('input');
    input.focus().keyup(this.search);
    if (data) {
      return input.attr('placeholder', this.formatDocument(data));
    }
  };

  LatestVersionReferenceNode.prototype.buildSearchURL = function(term) {
    return this.url + "?term=" + term + "&project=true";
  };

  LatestVersionReferenceNode.prototype.search = function() {
    var term;
    term = this.getValEl().find('input').val();
    if (term === this.lastTerm) {
      return;
    }
    if (this.lastTerm && !term) {
      this.getSearchResultsEl().empty();
    }
    if (!term) {
      return;
    }
    this.lastTerm = term;
    this.getSearchResultsEl().empty().append('Searching');
    this.collection = new LatestVersionCollection([], {
      model: this.model
    });
    this.collection.url = this.buildSearchURL(term);
    this.collection.fetch();
    return this.collection.once('sync', this.searchCallback, this);
  };

  LatestVersionReferenceNode.prototype.searchCallback = function() {
    var container, first, i, len, model, ref, row, text;
    container = this.getSearchResultsEl().detach().empty();
    first = true;
    ref = this.collection.models;
    for (i = 0, len = ref.length; i < len; i++) {
      model = ref[i];
      row = $('<div></div>').addClass('treema-search-result-row');
      text = this.formatDocument(model);
      if (text == null) {
        continue;
      }
      if (first) {
        row.addClass('treema-search-selected');
      }
      first = false;
      row.text(text);
      row.data('value', model);
      container.append(row);
    }
    if (!this.collection.models.length) {
      container.append($('<div>No results</div>'));
    }
    return this.getValEl().append(container);
  };

  LatestVersionReferenceNode.prototype.getSearchResultsEl = function() {
    return this.getValEl().find('.treema-search-results');
  };

  LatestVersionReferenceNode.prototype.getSelectedResultEl = function() {
    return this.getValEl().find('.treema-search-selected');
  };

  LatestVersionReferenceNode.prototype.modelToString = function(model) {
    return model.get('name');
  };

  LatestVersionReferenceNode.prototype.formatDocument = function(docOrModel) {
    var data, m, ref;
    if (docOrModel instanceof CocoModel) {
      return this.modelToString(docOrModel);
    }
    if (this.settings.supermodel == null) {
      return 'Unknown';
    }
    m = CocoModel.getReferencedModel(this.getData(), this.workingSchema);
    data = this.getData();
    if (_.isString(data)) {
      if (m.schema().properties.version) {
        m = this.settings.supermodel.getModelByOriginal(m.constructor, data);
      } else {
        m = this.settings.supermodel.getModel(m.constructor, data);
      }
    } else {
      m = this.settings.supermodel.getModelByOriginalAndMajorVersion(m.constructor, data.original, data.majorVersion);
    }
    if (this.instance && !m) {
      m = this.instance;
      this.settings.supermodel.registerModel(m);
    }
    if (!m) {
      return 'Unknown - ' + ((ref = data.original) != null ? ref : data);
    }
    return this.modelToString(m);
  };

  LatestVersionReferenceNode.prototype.saveChanges = function() {
    var fullValue, selected;
    selected = this.getSelectedResultEl();
    if (!selected.length) {
      return;
    }
    fullValue = selected.data('value');
    this.data = {
      original: fullValue.attributes.original,
      majorVersion: fullValue.attributes.version.major
    };
    return this.instance = fullValue;
  };

  LatestVersionReferenceNode.prototype.onDownArrowPressed = function(e) {
    if (!this.isEditing()) {
      return LatestVersionReferenceNode.__super__.onDownArrowPressed.apply(this, arguments);
    }
    this.navigateSearch(1);
    return e.preventDefault();
  };

  LatestVersionReferenceNode.prototype.onUpArrowPressed = function(e) {
    if (!this.isEditing()) {
      return LatestVersionReferenceNode.__super__.onUpArrowPressed.apply(this, arguments);
    }
    e.preventDefault();
    return this.navigateSearch(-1);
  };

  LatestVersionReferenceNode.prototype.navigateSearch = function(offset) {
    var func, next, selected;
    selected = this.getSelectedResultEl();
    func = offset > 0 ? 'next' : 'prev';
    next = selected[func]('.treema-search-result-row');
    if (!next.length) {
      return;
    }
    selected.removeClass('treema-search-selected');
    return next.addClass('treema-search-selected');
  };

  LatestVersionReferenceNode.prototype.onClick = function(e) {
    var newSelection;
    newSelection = $(e.target).closest('.treema-search-result-row');
    if (!newSelection.length) {
      return LatestVersionReferenceNode.__super__.onClick.call(this, e);
    }
    this.getSelectedResultEl().removeClass('treema-search-selected');
    newSelection.addClass('treema-search-selected');
    this.saveChanges();
    this.flushChanges();
    return this.display();
  };

  LatestVersionReferenceNode.prototype.shouldTryToRemoveFromParent = function() {
    var selected;
    if (this.data != null) {
      return;
    }
    selected = this.getSelectedResultEl();
    return !selected.length;
  };

  return LatestVersionReferenceNode;

})(TreemaNode);

module.exports.LatestVersionOriginalReferenceNode = LatestVersionOriginalReferenceNode = (function(superClass) {
  extend(LatestVersionOriginalReferenceNode, superClass);

  function LatestVersionOriginalReferenceNode() {
    return LatestVersionOriginalReferenceNode.__super__.constructor.apply(this, arguments);
  }

  LatestVersionOriginalReferenceNode.prototype.saveChanges = function() {
    var fullValue, selected;
    selected = this.getSelectedResultEl();
    if (!selected.length) {
      return;
    }
    fullValue = selected.data('value');
    this.data = fullValue.attributes.original;
    return this.instance = fullValue;
  };

  return LatestVersionOriginalReferenceNode;

})(LatestVersionReferenceNode);

module.exports.IDReferenceNode = IDReferenceNode = (function(superClass) {
  extend(IDReferenceNode, superClass);

  function IDReferenceNode() {
    return IDReferenceNode.__super__.constructor.apply(this, arguments);
  }

  IDReferenceNode.prototype.saveChanges = function() {
    var fullValue, selected;
    selected = this.getSelectedResultEl();
    if (!selected.length) {
      return;
    }
    fullValue = selected.data('value');
    this.data = fullValue.attributes._id;
    return this.instance = fullValue;
  };

  return IDReferenceNode;

})(LatestVersionReferenceNode);

LevelComponentReferenceNode = (function(superClass) {
  extend(LevelComponentReferenceNode, superClass);

  function LevelComponentReferenceNode() {
    return LevelComponentReferenceNode.__super__.constructor.apply(this, arguments);
  }

  LevelComponentReferenceNode.prototype.buildSearchURL = function(term) {
    return this.url + "?term=" + term + "&project=name,system,original,version,dependencies,configSchema,description";
  };

  LevelComponentReferenceNode.prototype.modelToString = function(model) {
    return model.get('system') + '.' + model.get('name');
  };

  LevelComponentReferenceNode.prototype.canEdit = function() {
    return !this.getData().original;
  };

  return LevelComponentReferenceNode;

})(LatestVersionReferenceNode);

LatestVersionReferenceNode.prototype.search = _.debounce(LatestVersionReferenceNode.prototype.search, 200);

SlugPropsObject = (function(superClass) {
  extend(SlugPropsObject, superClass);

  function SlugPropsObject() {
    return SlugPropsObject.__super__.constructor.apply(this, arguments);
  }

  SlugPropsObject.prototype.getPropertyKey = function() {
    var ref, res;
    res = SlugPropsObject.__super__.getPropertyKey.apply(this, arguments);
    if (((ref = this.workingSchema.properties) != null ? ref[res] : void 0) != null) {
      return res;
    }
    return _.string.slugify(res);
  };

  return SlugPropsObject;

})(TreemaNode.nodeMap.object);

TaskTreema = (function(superClass) {
  extend(TaskTreema, superClass);

  function TaskTreema() {
    this.onEditInputBlur = bind(this.onEditInputBlur, this);
    this.onTaskChanged = bind(this.onTaskChanged, this);
    return TaskTreema.__super__.constructor.apply(this, arguments);
  }

  TaskTreema.prototype.buildValueForDisplay = function(valEl) {
    var task;
    this.taskCheckbox = $('<input type="checkbox">').prop('checked', this.data.complete);
    task = $("<span>" + this.data.name + "</span>");
    valEl.append(this.taskCheckbox).append(task);
    return this.taskCheckbox.on('change', this.onTaskChanged);
  };

  TaskTreema.prototype.buildValueForEditing = function(valEl, data) {
    this.nameInput = this.buildValueForEditingSimply(valEl, data.name);
    return this.nameInput.parent().prepend(this.taskCheckbox);
  };

  TaskTreema.prototype.onTaskChanged = function(e) {
    this.markAsChanged();
    this.saveChanges();
    this.flushChanges();
    return this.broadcastChanges();
  };

  TaskTreema.prototype.onEditInputBlur = function(e) {
    this.markAsChanged();
    this.saveChanges();
    if (this.isValid()) {
      if (this.isEditing()) {
        this.display();
      }
    } else {
      this.nameInput.focus().select();
    }
    this.flushChanges();
    return this.broadcastChanges();
  };

  TaskTreema.prototype.saveChanges = function(oldData) {
    if (this.data == null) {
      this.data = {};
    }
    if (this.nameInput) {
      this.data.name = this.nameInput.val();
    }
    return this.data.complete = Boolean(this.taskCheckbox.prop('checked'));
  };

  TaskTreema.prototype.destroy = function() {
    this.taskCheckbox.off();
    return TaskTreema.__super__.destroy.call(this);
  };

  return TaskTreema;

})(TreemaNode.nodeMap.string);

module.exports.setup = function() {
  TreemaNode.setNodeSubclass('date-time', DateTimeTreema);
  TreemaNode.setNodeSubclass('version', VersionTreema);
  TreemaNode.setNodeSubclass('markdown', LiveEditingMarkup);
  TreemaNode.setNodeSubclass('code-languages-object', CodeLanguagesObjectTreema);
  TreemaNode.setNodeSubclass('code-language', CodeLanguageTreema);
  TreemaNode.setNodeSubclass('code', CodeTreema);
  TreemaNode.setNodeSubclass('coffee', CoffeeTreema);
  TreemaNode.setNodeSubclass('javascript', JavaScriptTreema);
  TreemaNode.setNodeSubclass('image-file', ImageFileTreema);
  TreemaNode.setNodeSubclass('latest-version-reference', LatestVersionReferenceNode);
  TreemaNode.setNodeSubclass('latest-version-original-reference', LatestVersionOriginalReferenceNode);
  TreemaNode.setNodeSubclass('component-reference', LevelComponentReferenceNode);
  TreemaNode.setNodeSubclass('i18n', InternationalizationNode);
  TreemaNode.setNodeSubclass('sound-file', SoundFileTreema);
  TreemaNode.setNodeSubclass('slug-props', SlugPropsObject);
  return TreemaNode.setNodeSubclass('task', TaskTreema);
};
});

;require.register("core/urls", function(exports, require, module) {
module.exports = {
  playDevLevel: function(arg) {
    var course, level, session, shareURL;
    level = arg.level, session = arg.session, course = arg.course;
    shareURL = window.location.origin + "/play/" + (level.get('type')) + "-level/" + (level.get('slug')) + "/" + session.id;
    if (course) {
      shareURL += "?course=" + course.id;
    }
    return shareURL;
  },
  courseArenaLadder: function(arg) {
    var courseInstance, level;
    level = arg.level, courseInstance = arg.courseInstance;
    return "/play/ladder/" + (level.get('slug')) + "/course/" + courseInstance.id;
  },
  courseLevel: function(arg) {
    var courseInstance, level, url;
    level = arg.level, courseInstance = arg.courseInstance;
    url = "/play/level/" + (level.get('slug')) + "?course=" + (courseInstance.get('courseID')) + "&course-instance=" + courseInstance.id;
    if (level.get('primerLanguage')) {
      url += "&codeLanguage=" + (level.get('primerLanguage'));
    }
    return url;
  }
};
});

;require.register("core/utils", function(exports, require, module) {
var TEXT, aceEditModes, capitalLanguages, clone, combineAncestralObject, compare, courseIDs, createLevelNumberMap, createLinearFunc, createLogFunc, createPowFunc, createQuadraticFunc, cutHex, dummy, filterMarkdownCodeLanguages, findNextLevel, functionCreators, getByPath, getCourseBundlePrice, getCoursePraise, getDocumentSearchString, getPrepaidCodeAmount, getQueryVariable, getQueryVariables, getSponsoredSubsAmount, getUTCDay, grayscale, hexToB, hexToG, hexToHSL, hexToR, hslToHex, i18n, initializeACE, injectCSS, isID, keepDoingUntil, kindaEqual, needsPractice, normalizeFunc, objectIdToDate, orderedCourseIDs, pathToUrl, positify, replaceText, round, sortCourses, startsWithVowel, toHex, usStateCodes, userAgent,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

clone = function(obj) {
  var key, temp;
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  temp = obj.constructor();
  for (key in obj) {
    temp[key] = clone(obj[key]);
  }
  return temp;
};

combineAncestralObject = function(obj, propertyName) {
  var combined, key, ref, value;
  combined = {};
  while (obj != null ? obj[propertyName] : void 0) {
    ref = obj[propertyName];
    for (key in ref) {
      value = ref[key];
      if (combined[key]) {
        continue;
      }
      combined[key] = value;
    }
    if (obj.__proto__) {
      obj = obj.__proto__;
    } else {
      obj = Object.getPrototypeOf(obj);
    }
  }
  return combined;
};

courseIDs = {
  INTRODUCTION_TO_COMPUTER_SCIENCE: '560f1a9f22961295f9427742',
  COMPUTER_SCIENCE_2: '5632661322961295f9428638',
  GAME_DEVELOPMENT_1: '5789587aad86a6efb573701e',
  WEB_DEVELOPMENT_1: '5789587aad86a6efb573701f',
  COMPUTER_SCIENCE_3: '56462f935afde0c6fd30fc8c',
  GAME_DEVELOPMENT_2: '57b621e7ad86a6efb5737e64',
  WEB_DEVELOPMENT_2: '5789587aad86a6efb5737020',
  COMPUTER_SCIENCE_4: '56462f935afde0c6fd30fc8d',
  COMPUTER_SCIENCE_5: '569ed916efa72b0ced971447'
};

orderedCourseIDs = [courseIDs.INTRODUCTION_TO_COMPUTER_SCIENCE, courseIDs.COMPUTER_SCIENCE_2, courseIDs.GAME_DEVELOPMENT_1, courseIDs.WEB_DEVELOPMENT_1, courseIDs.COMPUTER_SCIENCE_3, courseIDs.GAME_DEVELOPMENT_2, courseIDs.WEB_DEVELOPMENT_2, courseIDs.COMPUTER_SCIENCE_4, courseIDs.COMPUTER_SCIENCE_5];

normalizeFunc = function(func_thing, object) {
  var func;
  if (object == null) {
    object = {};
  }
  if (_.isString(func_thing)) {
    func = object[func_thing];
    if (!func) {
      console.error("Could not find method " + func_thing + " in object", object);
      return (function(_this) {
        return function() {
          return null;
        };
      })(this);
    }
    func_thing = func;
  }
  return func_thing;
};

objectIdToDate = function(objectID) {
  return new Date(parseInt(objectID.toString().slice(0, 8), 16) * 1000);
};

hexToHSL = function(hex) {
  return rgbToHsl(hexToR(hex), hexToG(hex), hexToB(hex));
};

hexToR = function(h) {
  return parseInt((cutHex(h)).substring(0, 2), 16);
};

hexToG = function(h) {
  return parseInt((cutHex(h)).substring(2, 4), 16);
};

hexToB = function(h) {
  return parseInt((cutHex(h)).substring(4, 6), 16);
};

cutHex = function(h) {
  if (h.charAt(0) === '#') {
    return h.substring(1, 7);
  } else {
    return h;
  }
};

hslToHex = function(hsl) {
  var n;
  return '#' + ((function() {
    var j, len, ref, results;
    ref = hslToRgb.apply(null, hsl);
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      n = ref[j];
      results.push(toHex(n));
    }
    return results;
  })()).join('');
};

toHex = function(n) {
  var h;
  h = Math.floor(n).toString(16);
  if (h.length === 1) {
    h = '0' + h;
  }
  return h;
};

pathToUrl = function(path) {
  var base;
  base = location.protocol + '//' + location.hostname + (location.port && ":" + location.port);
  return base + path;
};

i18n = function(say, target, language, fallback) {
  var fallBackResult, fallForwardResult, fallSidewaysResult, generalName, generalResult, locale, localeName, matches, ref, result;
  if (language == null) {
    language = me.get('preferredLanguage', true);
  }
  if (fallback == null) {
    fallback = 'en';
  }
  generalResult = null;
  fallBackResult = null;
  fallForwardResult = null;
  fallSidewaysResult = null;
  matches = /\w+/gi.exec(language);
  if (matches) {
    generalName = matches[0];
  }
  ref = say.i18n;
  for (localeName in ref) {
    locale = ref[localeName];
    if (localeName === '-') {
      continue;
    }
    if (target in locale) {
      result = locale[target];
    } else {
      continue;
    }
    if (localeName === language) {
      return result;
    }
    if (localeName === generalName) {
      generalResult = result;
    }
    if (localeName === fallback) {
      fallBackResult = result;
    }
    if (localeName.indexOf(language) === 0 && (fallForwardResult == null)) {
      fallForwardResult = result;
    }
    if (localeName.indexOf(generalName) === 0 && (fallSidewaysResult == null)) {
      fallSidewaysResult = result;
    }
  }
  if (generalResult != null) {
    return generalResult;
  }
  if (fallForwardResult != null) {
    return fallForwardResult;
  }
  if (fallSidewaysResult != null) {
    return fallSidewaysResult;
  }
  if (fallBackResult != null) {
    return fallBackResult;
  }
  if (target in say) {
    return say[target];
  }
  return null;
};

getByPath = function(target, path) {
  var j, len, obj, piece, pieces;
  if (!target) {
    throw new Error('Expected an object to match a query against, instead got null');
  }
  pieces = path.split('.');
  obj = target;
  for (j = 0, len = pieces.length; j < len; j++) {
    piece = pieces[j];
    if (!(piece in obj)) {
      return void 0;
    }
    obj = obj[piece];
  }
  return obj;
};

isID = function(id) {
  var ref;
  return _.isString(id) && id.length === 24 && ((ref = id.match(/[a-f0-9]/gi)) != null ? ref.length : void 0) === 24;
};

round = _.curry(function(digits, n) {
  return n = +n.toFixed(digits);
});

positify = function(func) {
  return function(params) {
    return function(x) {
      if (x > 0) {
        return func(params)(x);
      } else {
        return 0;
      }
    };
  };
};

createLinearFunc = function(params) {
  return function(x) {
    return (params.a || 1) * x + (params.b || 0);
  };
};

createQuadraticFunc = function(params) {
  return function(x) {
    return (params.a || 1) * x * x + (params.b || 1) * x + (params.c || 0);
  };
};

createLogFunc = function(params) {
  return function(x) {
    if (x > 0) {
      return (params.a || 1) * Math.log((params.b || 1) * (x + (params.c || 0))) + (params.d || 0);
    } else {
      return 0;
    }
  };
};

createPowFunc = function(params) {
  return function(x) {
    return (params.a || 1) * Math.pow(x, params.b || 1) + (params.c || 0);
  };
};

functionCreators = {
  linear: positify(createLinearFunc),
  quadratic: positify(createQuadraticFunc),
  logarithmic: positify(createLogFunc),
  pow: positify(createPowFunc)
};

keepDoingUntil = function(func, wait, totalWait) {
  var done, waitSoFar;
  if (wait == null) {
    wait = 100;
  }
  if (totalWait == null) {
    totalWait = 5000;
  }
  waitSoFar = 0;
  return (done = function(success) {
    if ((waitSoFar += wait) <= totalWait && !success) {
      return _.delay((function() {
        return func(done);
      }), wait);
    }
  })(false);
};

grayscale = function(imageData) {
  var b, d, g, i, j, r, ref, v;
  d = imageData.data;
  for (i = j = 0, ref = d.length; j <= ref; i = j += 4) {
    r = d[i];
    g = d[i + 1];
    b = d[i + 2];
    v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  return imageData;
};

kindaEqual = compare = function(l, r) {
  var j, key, len, ref;
  if (_.isObject(l) && _.isObject(r)) {
    ref = _.union(Object.keys(l), Object.keys(r));
    for (j = 0, len = ref.length; j < len; j++) {
      key = ref[j];
      if (!compare(l[key], r[key])) {
        return false;
      }
    }
    return true;
  } else if (l === r) {
    return true;
  } else {
    return false;
  }
};

getUTCDay = function(offset) {
  var day, partDay, partMonth, partYear;
  if (offset == null) {
    offset = 0;
  }
  day = new Date();
  day.setDate(day.getUTCDate() + offset);
  partYear = day.getUTCFullYear();
  partMonth = day.getUTCMonth() + 1;
  if (partMonth < 10) {
    partMonth = "0" + partMonth;
  }
  partDay = day.getUTCDate();
  if (partDay < 10) {
    partDay = "0" + partDay;
  }
  return "" + partYear + partMonth + partDay;
};

if (typeof document !== "undefined" && document !== null ? document.createElement : void 0) {
  dummy = document.createElement('div');
  dummy.innerHTML = 'text';
  TEXT = dummy.textContent === 'text' ? 'textContent' : 'innerText';
  replaceText = function(elems, text) {
    var elem, j, len;
    for (j = 0, len = elems.length; j < len; j++) {
      elem = elems[j];
      elem[TEXT] = text;
    }
    return null;
  };
}

if (typeof document !== "undefined" && document !== null ? document.createElement : void 0) {
  injectCSS = (function(doc) {
    var temp, wrap;
    wrap = doc.createElement("div");
    temp = doc.createElement("div");
    return function(cssRules) {
      if (!wrap.id) {
        wrap.id = "injected-css";
        wrap.style.display = "none";
        doc.body.appendChild(wrap);
      }
      temp.innerHTML = "<br><style>" + cssRules + "</style>";
      wrap.appendChild(temp.children[1]);
    };
  })(document);
}

userAgent = function() {
  return window.navigator.userAgent;
};

getDocumentSearchString = function() {
  return document.location.search;
};

getQueryVariables = function() {
  var j, key, len, pair, pairs, query, ref, ref1, value, variables;
  query = module.exports.getDocumentSearchString().substring(1);
  pairs = (function() {
    var j, len, ref, results;
    ref = query.split('&');
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      pair = ref[j];
      results.push(pair.split('='));
    }
    return results;
  })();
  variables = {};
  for (j = 0, len = pairs.length; j < len; j++) {
    ref = pairs[j], key = ref[0], value = ref[1];
    variables[key] = (ref1 = {
      'true': true,
      'false': false
    }[value]) != null ? ref1 : decodeURIComponent(value);
  }
  return variables;
};

getQueryVariable = function(param, defaultValue) {
  var ref, variables;
  variables = getQueryVariables();
  return (ref = variables[param]) != null ? ref : defaultValue;
};

getSponsoredSubsAmount = function(price, subCount, personalSub) {
  var offset;
  if (price == null) {
    price = 999;
  }
  if (subCount == null) {
    subCount = 0;
  }
  if (personalSub == null) {
    personalSub = false;
  }
  if (!(subCount > 0)) {
    return 0;
  }
  offset = personalSub ? 1 : 0;
  if (subCount <= 1 - offset) {
    return price;
  } else if (subCount <= 11 - offset) {
    return Math.round((1 - offset) * price + (subCount - 1 + offset) * price * 0.8);
  } else {
    return Math.round((1 - offset) * price + 10 * price * 0.8 + (subCount - 11 + offset) * price * 0.6);
  }
};

getCourseBundlePrice = function(coursePrices, seats) {
  var pricePerSeat, totalPricePerSeat;
  if (seats == null) {
    seats = 20;
  }
  totalPricePerSeat = coursePrices.reduce((function(a, b) {
    return a + b;
  }), 0);
  if (coursePrices.length > 2) {
    pricePerSeat = Math.round(totalPricePerSeat / 2.0);
  } else {
    pricePerSeat = parseInt(totalPricePerSeat);
  }
  return seats * pricePerSeat;
};

getCoursePraise = function() {
  var praise;
  praise = [
    {
      quote: "The kids love it.",
      source: "Leo Joseph Tran, Athlos Leadership Academy"
    }, {
      quote: "My students have been using the site for a couple of weeks and they love it.",
      source: "Scott Hatfield, Computer Applications Teacher, School Technology Coordinator, Eastside Middle School"
    }, {
      quote: "Thanks for the captivating site. My eighth graders love it.",
      source: "Janet Cook, Ansbach Middle/High School"
    }, {
      quote: "My students have started working on CodeCombat and love it! I love that they are learning coding and problem solving skills without them even knowing it!!",
      source: "Kristin Huff, Special Education Teacher, Webb City School District"
    }, {
      quote: "I recently introduced Code Combat to a few of my fifth graders and they are loving it!",
      source: "Shauna Hamman, Fifth Grade Teacher, Four Peaks Elementary School"
    }, {
      quote: "Overall I think it's a fantastic service. Variables, arrays, loops, all covered in very fun and imaginative ways. Every kid who has tried it is a fan.",
      source: "Aibinder Andrew, Technology Teacher"
    }, {
      quote: "I love what you have created. The kids are so engaged.",
      source: "Desmond Smith, 4KS Academy"
    }, {
      quote: "My students love the website and I hope on having content structured around it in the near future.",
      source: "Michael Leonard, Science Teacher, Clearwater Central Catholic High School"
    }
  ];
  return praise[_.random(0, praise.length - 1)];
};

getPrepaidCodeAmount = function(price, users, months) {
  var total;
  if (price == null) {
    price = 0;
  }
  if (users == null) {
    users = 0;
  }
  if (months == null) {
    months = 0;
  }
  if (!(users > 0 && months > 0)) {
    return 0;
  }
  total = price * users * months;
  return total;
};

startsWithVowel = function(s) {
  var ref;
  return ref = s[0], indexOf.call('aeiouAEIOU', ref) >= 0;
};

filterMarkdownCodeLanguages = function(text, language) {
  var codeBlockExclusionRegex, commonLanguageReplacements, currentLanguage, excludedLanguages, from, imageExclusionRegex, j, len, ref, ref1, ref2, ref3, to;
  if (!text) {
    return '';
  }
  currentLanguage = language || ((ref = me.get('aceConfig')) != null ? ref.language : void 0) || 'python';
  excludedLanguages = _.without(['javascript', 'python', 'coffeescript', 'clojure', 'lua', 'java', 'io', 'html'], currentLanguage);
  codeBlockExclusionRegex = new RegExp("```(" + (excludedLanguages.join('|')) + ")\n[^`]+```\n?", 'gm');
  imageExclusionRegex = new RegExp("!\\[(" + (excludedLanguages.join('|')) + ") - .+?\\]\\(.+?\\)\n?", 'gm');
  text = text.replace(codeBlockExclusionRegex, '').replace(imageExclusionRegex, '');
  commonLanguageReplacements = {
    python: [['true', 'True'], ['false', 'False'], ['null', 'None'], ['object', 'dictionary'], ['Object', 'Dictionary'], ['array', 'list'], ['Array', 'List']],
    lua: [['null', 'nil'], ['object', 'table'], ['Object', 'Table'], ['array', 'table'], ['Array', 'Table']]
  };
  ref2 = (ref1 = commonLanguageReplacements[currentLanguage]) != null ? ref1 : [];
  for (j = 0, len = ref2.length; j < len; j++) {
    ref3 = ref2[j], from = ref3[0], to = ref3[1];
    text = text.replace(RegExp("`" + from + "`", "g"), "`" + to + "`");
    if (startsWithVowel(from) && !startsWithVowel(to)) {
      text = text.replace(RegExp("( a|A)n( `" + to + "`)", "g"), "$1$2");
    }
    if (!startsWithVowel(from) && startsWithVowel(to)) {
      text = text.replace(RegExp("( a|A)( `" + to + "`)", "g"), "$1n$2");
    }
  }
  return text;
};

aceEditModes = {
  javascript: 'ace/mode/javascript',
  coffeescript: 'ace/mode/coffee',
  python: 'ace/mode/python',
  lua: 'ace/mode/lua',
  java: 'ace/mode/java',
  html: 'ace/mode/html'
};

initializeACE = function(el, codeLanguage) {
  var contents, editor, session;
  contents = $(el).text().trim();
  editor = ace.edit(el);
  editor.setOptions({
    maxLines: Infinity
  });
  editor.setReadOnly(true);
  editor.setTheme('ace/theme/textmate');
  editor.setShowPrintMargin(false);
  editor.setShowFoldWidgets(false);
  editor.setHighlightActiveLine(false);
  editor.setHighlightActiveLine(false);
  editor.setBehavioursEnabled(false);
  editor.renderer.setShowGutter(false);
  editor.setValue(contents);
  editor.clearSelection();
  session = editor.getSession();
  session.setUseWorker(false);
  session.setMode(aceEditModes[codeLanguage]);
  session.setWrapLimitRange(null);
  session.setUseWrapMode(true);
  session.setNewLineMode('unix');
  return editor;
};

capitalLanguages = {
  'javascript': 'JavaScript',
  'coffeescript': 'CoffeeScript',
  'python': 'Python',
  'java': 'Java',
  'lua': 'Lua',
  'html': 'HTML'
};

createLevelNumberMap = function(levels) {
  var i, j, len, level, levelNumber, levelNumberMap, practiceLevelCurrentCount, practiceLevelTotalCount;
  levelNumberMap = {};
  practiceLevelTotalCount = 0;
  practiceLevelCurrentCount = 0;
  for (i = j = 0, len = levels.length; j < len; i = ++j) {
    level = levels[i];
    levelNumber = i - practiceLevelTotalCount + 1;
    if (level.practice) {
      levelNumber = i - practiceLevelTotalCount + String.fromCharCode('a'.charCodeAt(0) + practiceLevelCurrentCount);
      practiceLevelTotalCount++;
      practiceLevelCurrentCount++;
    } else {
      practiceLevelCurrentCount = 0;
    }
    levelNumberMap[level.key] = levelNumber;
  }
  return levelNumberMap;
};

findNextLevel = function(levels, currentIndex, needsPractice) {
  var index;
  index = currentIndex;
  index++;
  if (needsPractice) {
    if (levels[currentIndex].practice || index < levels.length && levels[index].practice) {
      while (index < levels.length && levels[index].complete) {
        index++;
      }
    } else {
      index--;
      while (index >= 0 && !levels[index].practice) {
        index--;
      }
      if (index >= 0) {
        while (index >= 0 && levels[index].practice) {
          index--;
        }
        if (index >= 0) {
          index++;
          while (index < levels.length && levels[index].practice && levels[index].complete) {
            index++;
          }
          if (levels[index].practice && !levels[index].complete) {
            return index;
          }
        }
      }
      index = currentIndex + 1;
      while (index < levels.length && levels[index].complete) {
        index++;
      }
    }
  } else {
    while (index < levels.length && (levels[index].practice || levels[index].complete)) {
      index++;
    }
  }
  return index;
};

needsPractice = function(playtime, threshold) {
  if (playtime == null) {
    playtime = 0;
  }
  if (threshold == null) {
    threshold = 2;
  }
  return playtime / 60 > threshold;
};

sortCourses = function(courses) {
  return _.sortBy(courses, function(course) {
    var index, ref;
    index = orderedCourseIDs.indexOf((ref = course.id) != null ? ref : course._id);
    if (index === -1) {
      index = 9001;
    }
    return index;
  });
};

usStateCodes = (function() {
  var getStateCodeByStateName, getStateNameByStateCode, sanitizeStateCode, sanitizeStateName, stateCodesByName, stateNamesByCode;
  stateNamesByCode = {
    'AL': 'Alabama',
    'AK': 'Alaska',
    'AZ': 'Arizona',
    'AR': 'Arkansas',
    'CA': 'California',
    'CO': 'Colorado',
    'CT': 'Connecticut',
    'DE': 'Delaware',
    'DC': 'District of Columbia',
    'FL': 'Florida',
    'GA': 'Georgia',
    'HI': 'Hawaii',
    'ID': 'Idaho',
    'IL': 'Illinois',
    'IN': 'Indiana',
    'IA': 'Iowa',
    'KS': 'Kansas',
    'KY': 'Kentucky',
    'LA': 'Louisiana',
    'ME': 'Maine',
    'MD': 'Maryland',
    'MA': 'Massachusetts',
    'MI': 'Michigan',
    'MN': 'Minnesota',
    'MS': 'Mississippi',
    'MO': 'Missouri',
    'MT': 'Montana',
    'NE': 'Nebraska',
    'NV': 'Nevada',
    'NH': 'New Hampshire',
    'NJ': 'New Jersey',
    'NM': 'New Mexico',
    'NY': 'New York',
    'NC': 'North Carolina',
    'ND': 'North Dakota',
    'OH': 'Ohio',
    'OK': 'Oklahoma',
    'OR': 'Oregon',
    'PA': 'Pennsylvania',
    'RI': 'Rhode Island',
    'SC': 'South Carolina',
    'SD': 'South Dakota',
    'TN': 'Tennessee',
    'TX': 'Texas',
    'UT': 'Utah',
    'VT': 'Vermont',
    'VA': 'Virginia',
    'WA': 'Washington',
    'WV': 'West Virginia',
    'WI': 'Wisconsin',
    'WY': 'Wyoming'
  };
  stateCodesByName = _.invert(stateNamesByCode);
  sanitizeStateCode = function(code) {
    code = _.isString(code) ? code.trim().toUpperCase().replace(/[^A-Z]/g, '') : null;
    if (stateNamesByCode[code]) {
      return code;
    } else {
      return null;
    }
  };
  getStateNameByStateCode = function(code) {
    return stateNamesByCode[sanitizeStateCode(code)] || null;
  };
  sanitizeStateName = function(name) {
    var tokens;
    if (!_.isString(name)) {
      return null;
    }
    name = name.trim().toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ');
    tokens = name.split(/\s+/);
    tokens = _.map(tokens, function(token) {
      return token.charAt(0).toUpperCase() + token.slice(1);
    });
    if (tokens.length > 2) {
      tokens[1] = tokens[1].toLowerCase();
    }
    name = tokens.join(' ');
    if (stateCodesByName[name]) {
      return name;
    } else {
      return null;
    }
  };
  getStateCodeByStateName = function(name) {
    return stateCodesByName[sanitizeStateName(name)] || null;
  };
  return {
    sanitizeStateCode: sanitizeStateCode,
    getStateNameByStateCode: getStateNameByStateCode,
    sanitizeStateName: sanitizeStateName,
    getStateCodeByStateName: getStateCodeByStateName
  };
})();

module.exports = {
  aceEditModes: aceEditModes,
  capitalLanguages: capitalLanguages,
  clone: clone,
  combineAncestralObject: combineAncestralObject,
  courseIDs: courseIDs,
  createLevelNumberMap: createLevelNumberMap,
  filterMarkdownCodeLanguages: filterMarkdownCodeLanguages,
  findNextLevel: findNextLevel,
  functionCreators: functionCreators,
  getByPath: getByPath,
  getCourseBundlePrice: getCourseBundlePrice,
  getCoursePraise: getCoursePraise,
  getDocumentSearchString: getDocumentSearchString,
  getPrepaidCodeAmount: getPrepaidCodeAmount,
  getQueryVariable: getQueryVariable,
  getQueryVariables: getQueryVariables,
  getSponsoredSubsAmount: getSponsoredSubsAmount,
  getUTCDay: getUTCDay,
  grayscale: grayscale,
  hexToHSL: hexToHSL,
  hslToHex: hslToHex,
  i18n: i18n,
  initializeACE: initializeACE,
  injectCSS: injectCSS,
  isID: isID,
  keepDoingUntil: keepDoingUntil,
  kindaEqual: kindaEqual,
  needsPractice: needsPractice,
  normalizeFunc: normalizeFunc,
  objectIdToDate: objectIdToDate,
  orderedCourseIDs: orderedCourseIDs,
  pathToUrl: pathToUrl,
  replaceText: replaceText,
  round: round,
  sortCourses: sortCourses,
  usStateCodes: usStateCodes,
  userAgent: userAgent
};
});

;require.register("views/core/AchievementPopup", function(exports, require, module) {
var Achievement, AchievementPopup, CocoView, User, template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoView = require('views/core/CocoView');

template = require('templates/core/achievement-popup');

User = require('../../models/User');

Achievement = require('../../models/Achievement');

module.exports = AchievementPopup = (function(superClass) {
  extend(AchievementPopup, superClass);

  AchievementPopup.prototype.className = 'achievement-popup';

  AchievementPopup.prototype.template = template;

  function AchievementPopup(options) {
    this.achievement = options.achievement;
    this.earnedAchievement = options.earnedAchievement;
    this.container = options.container || this.getContainer();
    this.popup = options.container;
    if (this.popup == null) {
      this.popup = true;
    }
    if (this.popup) {
      this.className += ' popup';
    }
    AchievementPopup.__super__.constructor.call(this, options);
    this.render();
  }

  AchievementPopup.prototype.calculateData = function() {
    var achievedXP, alreadyAchievedPercentage, currentLevel, currentLevelXP, currentXP, data, expFunction, leveledUp, newlyAchievedPercentage, nextLevel, nextLevelXP, previousXP, totalXPNeeded;
    currentLevel = me.level();
    nextLevel = currentLevel + 1;
    currentLevelXP = User.expForLevel(currentLevel);
    nextLevelXP = User.expForLevel(nextLevel);
    totalXPNeeded = nextLevelXP - currentLevelXP;
    expFunction = this.achievement.getExpFunction();
    currentXP = me.get('points', true);
    if (this.achievement.isRepeatable()) {
      if (this.achievement.isRepeatable()) {
        achievedXP = expFunction(this.earnedAchievement.get('previouslyAchievedAmount')) * this.achievement.get('worth');
      }
    } else {
      achievedXP = this.achievement.get('worth', true);
    }
    previousXP = currentXP - achievedXP;
    leveledUp = currentXP - achievedXP < currentLevelXP;
    alreadyAchievedPercentage = 100 * (previousXP - currentLevelXP) / totalXPNeeded;
    if (alreadyAchievedPercentage < 0) {
      alreadyAchievedPercentage = 0;
    }
    newlyAchievedPercentage = leveledUp ? 100 * (currentXP - currentLevelXP) / totalXPNeeded : 100 * achievedXP / totalXPNeeded;
    return data = {
      title: this.achievement.i18nName(),
      imgURL: this.achievement.getImageURL(),
      description: this.achievement.i18nDescription(),
      level: currentLevel,
      currentXP: currentXP,
      newXP: achievedXP,
      leftXP: nextLevelXP - currentXP,
      oldXPWidth: alreadyAchievedPercentage,
      newXPWidth: newlyAchievedPercentage,
      leftXPWidth: 100 - newlyAchievedPercentage - alreadyAchievedPercentage
    };
  };

  AchievementPopup.prototype.getRenderData = function() {
    var c;
    c = AchievementPopup.__super__.getRenderData.call(this);
    _.extend(c, this.calculateData());
    c.style = this.achievement.getStyle();
    c.popup = true;
    c.$ = $;
    return c;
  };

  AchievementPopup.prototype.render = function() {
    var hide;
    AchievementPopup.__super__.render.call(this);
    this.container.prepend(this.$el);
    if (this.popup) {
      hide = (function(_this) {
        return function() {
          if (_this.destroyed) {
            return;
          }
          return _this.$el.animate({
            left: -600
          }, function() {
            _this.$el.remove();
            return _this.destroy();
          });
        };
      })(this);
      this.$el.animate({
        left: 0
      });
      this.$el.on('click', hide);
      if (!$('#editor-achievement-edit-view').length) {
        return _.delay(hide, 10000);
      }
    }
  };

  AchievementPopup.prototype.getContainer = function() {
    if (!this.container) {
      this.container = $('.achievement-popup-container');
      if (!this.container.length) {
        $('body').append('<div class="achievement-popup-container"></div>');
        this.container = $('.achievement-popup-container');
      }
    }
    return this.container;
  };

  AchievementPopup.prototype.afterRender = function() {
    AchievementPopup.__super__.afterRender.call(this);
    return _.delay(this.initializeTooltips, 1000);
  };

  AchievementPopup.prototype.initializeTooltips = function() {
    return $('.progress-bar').addClass('has-tooltip').tooltip();
  };

  return AchievementPopup;

})(CocoView);
});

;require.register("views/core/AuthModal", function(exports, require, module) {
var AuthModal, ModalView, User, application, errors, formSchema, forms, loginNavigate, template,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ModalView = require('views/core/ModalView');

template = require('templates/core/auth-modal');

forms = require('core/forms');

User = require('models/User');

application = require('core/application');

errors = require('core/errors');

module.exports = AuthModal = (function(superClass) {
  extend(AuthModal, superClass);

  function AuthModal() {
    this.onFacebookLoginError = bind(this.onFacebookLoginError, this);
    this.onGPlusLoginError = bind(this.onGPlusLoginError, this);
    return AuthModal.__super__.constructor.apply(this, arguments);
  }

  AuthModal.prototype.id = 'auth-modal';

  AuthModal.prototype.template = template;

  AuthModal.prototype.events = {
    'click #switch-to-signup-btn': 'onSignupInstead',
    'submit form': 'onSubmitForm',
    'keyup #name': 'onNameChange',
    'click #gplus-login-btn': 'onClickGPlusLoginButton',
    'click #facebook-login-btn': 'onClickFacebookLoginButton',
    'click #close-modal': 'hide'
  };

  AuthModal.prototype.initialize = function(options) {
    var base;
    if (options == null) {
      options = {};
    }
    this.previousFormInputs = options.initialValues || {};
    if ((base = this.previousFormInputs).emailOrUsername == null) {
      base.emailOrUsername = this.previousFormInputs.email || this.previousFormInputs.username;
    }
    application.gplusHandler.loadAPI({
      success: (function(_this) {
        return function() {
          return _.defer(function() {
            return _this.$('#gplus-login-btn').attr('disabled', false);
          });
        };
      })(this)
    });
    return application.facebookHandler.loadAPI({
      success: (function(_this) {
        return function() {
          return _.defer(function() {
            return _this.$('#facebook-login-btn').attr('disabled', false);
          });
        };
      })(this)
    });
  };

  AuthModal.prototype.afterRender = function() {
    AuthModal.__super__.afterRender.call(this);
    return this.playSound('game-menu-open');
  };

  AuthModal.prototype.afterInsert = function() {
    AuthModal.__super__.afterInsert.call(this);
    return _.delay(((function(_this) {
      return function() {
        return $('input:visible:first', _this.$el).focus();
      };
    })(this)), 500);
  };

  AuthModal.prototype.onSignupInstead = function(e) {
    var CreateAccountModal, modal;
    CreateAccountModal = require('./CreateAccountModal');
    modal = new CreateAccountModal({
      initialValues: forms.formToObject(this.$el)
    });
    return currentView.openModalView(modal);
  };

  AuthModal.prototype.onSubmitForm = function(e) {
    var res, userObject;
    this.playSound('menu-button-click');
    e.preventDefault();
    forms.clearFormAlerts(this.$el);
    this.$('#unknown-error-alert').addClass('hide');
    userObject = forms.formToObject(this.$el);
    res = tv4.validateMultiple(userObject, formSchema);
    if (!res.valid) {
      return forms.applyErrorsToForm(this.$el, res.errors);
    }
    return new Promise(me.loginPasswordUser(userObject.emailOrUsername, userObject.password).then).then(function() {
      if (window.nextURL) {
        return window.location.href = window.nextURL;
      } else {
        return loginNavigate();
      }
    })["catch"]((function(_this) {
      return function(jqxhr) {
        var errorID, showingError;
        showingError = false;
        if (jqxhr.status === 401) {
          errorID = jqxhr.responseJSON.errorID;
          if (errorID === 'not-found') {
            forms.setErrorToProperty(_this.$el, 'emailOrUsername', $.i18n.t('loading_error.not_found'));
            showingError = true;
          }
          if (errorID === 'wrong-password') {
            forms.setErrorToProperty(_this.$el, 'password', $.i18n.t('account_settings.wrong_password'));
            showingError = true;
          }
        }
        if (!showingError) {
          return _this.$('#unknown-error-alert').removeClass('hide');
        }
      };
    })(this));
  };

  AuthModal.prototype.onClickGPlusLoginButton = function() {
    var btn;
    btn = this.$('#gplus-login-btn');
    return application.gplusHandler.connect({
      context: this,
      success: function() {
        btn.find('.sign-in-blurb').text($.i18n.t('login.logging_in'));
        btn.attr('disabled', true);
        return application.gplusHandler.loadPerson({
          context: this,
          success: function(gplusAttrs) {
            var existingUser;
            existingUser = new User();
            return existingUser.fetchGPlusUser(gplusAttrs.gplusID, {
              success: (function(_this) {
                return function() {
                  return me.loginGPlusUser(gplusAttrs.gplusID, {
                    success: function() {
                      return loginNavigate();
                    },
                    error: _this.onGPlusLoginError
                  });
                };
              })(this),
              error: this.onGPlusLoginError
            });
          }
        });
      }
    });
  };

  AuthModal.prototype.onGPlusLoginError = function() {
    var btn;
    btn = this.$('#gplus-login-btn');
    btn.find('.sign-in-blurb').text($.i18n.t('login.sign_in_with_gplus'));
    btn.attr('disabled', false);
    return errors.showNotyNetworkError.apply(errors, arguments);
  };

  AuthModal.prototype.onClickFacebookLoginButton = function() {
    var btn;
    btn = this.$('#facebook-login-btn');
    return application.facebookHandler.connect({
      context: this,
      success: function() {
        btn.find('.sign-in-blurb').text($.i18n.t('login.logging_in'));
        btn.attr('disabled', true);
        return application.facebookHandler.loadPerson({
          context: this,
          success: function(facebookAttrs) {
            var existingUser;
            existingUser = new User();
            return existingUser.fetchFacebookUser(facebookAttrs.facebookID, {
              success: (function(_this) {
                return function() {
                  return me.loginFacebookUser(facebookAttrs.facebookID, {
                    success: function() {
                      return loginNavigate();
                    },
                    error: _this.onFacebookLoginError
                  });
                };
              })(this),
              error: this.onFacebookLoginError
            });
          }
        });
      }
    });
  };

  AuthModal.prototype.onFacebookLoginError = function() {
    var btn;
    btn = this.$('#facebook-login-btn');
    btn.find('.sign-in-blurb').text($.i18n.t('login.sign_in_with_facebook'));
    btn.attr('disabled', false);
    return errors.showNotyNetworkError.apply(errors, arguments);
  };

  AuthModal.prototype.onHidden = function() {
    AuthModal.__super__.onHidden.call(this);
    return this.playSound('game-menu-close');
  };

  return AuthModal;

})(ModalView);

formSchema = {
  type: 'object',
  properties: {
    emailOrUsername: {
      $or: [User.schema.properties.name, User.schema.properties.email]
    },
    password: User.schema.properties.password
  },
  required: ['emailOrUsername', 'password']
};

loginNavigate = function() {
  if (me.isStudent()) {
    application.router.navigate('/students', {
      trigger: true
    });
  } else if (me.isTeacher()) {
    application.router.navigate('/teachers/classes', {
      trigger: true
    });
  }
  return window.location.reload();
};
});

;require.register("views/core/CocoView", function(exports, require, module) {
var CocoClass, CocoView, SuperModel, auth, classCount, doNothing, lastToggleModalCall, loadingErrorTemplate, loadingScreenTemplate, makeScopeName, mobileRELong, mobileREShort, utils, visibleModal, waitingModal,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

SuperModel = require('models/SuperModel');

utils = require('core/utils');

CocoClass = require('core/CocoClass');

loadingScreenTemplate = require('templates/core/loading');

loadingErrorTemplate = require('templates/core/loading-error');

auth = require('core/auth');

lastToggleModalCall = 0;

visibleModal = null;

waitingModal = null;

classCount = 0;

makeScopeName = function() {
  return "view-scope-" + (classCount++);
};

doNothing = function() {};

module.exports = CocoView = (function(superClass) {
  extend(CocoView, superClass);

  CocoView.prototype.cache = false;

  CocoView.prototype.retainSubviews = false;

  CocoView.prototype.template = function() {
    return '';
  };

  CocoView.prototype.events = {
    'click #loading-error .login-btn': 'onClickLoadingErrorLoginButton',
    'click #loading-error #create-account-btn': 'onClickLoadingErrorCreateAccountButton',
    'click #loading-error #logout-btn': 'onClickLoadingErrorLogoutButton',
    'click .contact-modal': 'onClickContactModal'
  };

  CocoView.prototype.subscriptions = {};

  CocoView.prototype.shortcuts = {};

  CocoView.prototype.loadProgress = {
    progress: 0
  };

  function CocoView(options) {
    this.animatePointer = bind(this.animatePointer, this);
    this.modalClosed = bind(this.modalClosed, this);
    this.updateProgressBar = bind(this.updateProgressBar, this);
    var listenedSupermodel;
    this.loadProgress = _.cloneDeep(this.loadProgress);
    if (this.supermodel == null) {
      this.supermodel = new SuperModel();
    }
    this.options = options;
    if (options != null ? options.supermodel : void 0) {
      this.supermodel.models = options.supermodel.models;
      this.supermodel.collections = options.supermodel.collections;
      this.supermodel.shouldSaveBackups = options.supermodel.shouldSaveBackups;
    }
    this.subscriptions = utils.combineAncestralObject(this, 'subscriptions');
    this.events = utils.combineAncestralObject(this, 'events');
    this.scope = makeScopeName();
    this.shortcuts = utils.combineAncestralObject(this, 'shortcuts');
    this.subviews = {};
    this.listenToShortcuts();
    this.updateProgressBar = _.debounce(this.updateProgressBar, 100);
    this.listenTo(this.supermodel, 'loaded-all', this.onLoaded);
    this.listenTo(this.supermodel, 'update-progress', this.updateProgress);
    this.listenTo(this.supermodel, 'failed', this.onResourceLoadFailed);
    this.warnConnectionError = _.throttle(this.warnConnectionError, 3000);
    listenedSupermodel = this.supermodel;
    _.defer((function(_this) {
      return function() {
        var ref, ref1;
        if (listenedSupermodel !== _this.supermodel && !_this.destroyed) {
          throw new Error(((ref = (ref1 = _this.constructor) != null ? ref1.name : void 0) != null ? ref : _this) + ": Supermodel listeners not hooked up! Don't reassign @supermodel; CocoView does that for you.");
        }
      };
    })(this));
    CocoView.__super__.constructor.apply(this, arguments);
  }

  CocoView.prototype.destroy = function() {
    var id, key, ref, value, view;
    this.stopListening();
    this.off();
    this.stopListeningToShortcuts();
    this.undelegateEvents();
    ref = this.subviews;
    for (id in ref) {
      view = ref[id];
      view.destroy();
    }
    $('#modal-wrapper .modal').off('hidden.bs.modal', this.modalClosed);
    this.$el.find('.has-tooltip, [data-original-title]').tooltip('destroy');
    this.endHighlight();
    this.getPointer(false).remove();
    for (key in this) {
      value = this[key];
      this[key] = void 0;
    }
    this.destroyed = true;
    this.off = doNothing;
    this.destroy = doNothing;
    return $.noty.closeAll();
  };

  CocoView.prototype.destroyAceEditor = function(editor) {
    var session;
    if (!editor) {
      return;
    }
    session = editor.getSession();
    session.setMode('');
    return editor.destroy();
  };

  CocoView.prototype.afterInsert = function() {};

  CocoView.prototype.willDisappear = function() {
    var id, ref, view;
    this.undelegateEvents();
    this.hidden = true;
    this.stopListeningToShortcuts();
    ref = this.subviews;
    for (id in ref) {
      view = ref[id];
      view.willDisappear();
    }
    return $.noty.closeAll();
  };

  CocoView.prototype.didReappear = function() {
    var id, ref, results, view, wasHidden;
    this.delegateEvents();
    wasHidden = this.hidden;
    this.hidden = false;
    if (wasHidden) {
      this.listenToShortcuts();
    }
    ref = this.subviews;
    results = [];
    for (id in ref) {
      view = ref[id];
      results.push(view.didReappear());
    }
    return results;
  };

  CocoView.prototype.renderSelectors = function() {
    var elPair, i, j, k, len, len1, newTemplate, ref, selector, selectors;
    selectors = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    newTemplate = $(this.template(this.getRenderData()));
    for (i = j = 0, len = selectors.length; j < len; i = ++j) {
      selector = selectors[i];
      ref = _.zip(this.$el.find(selector), newTemplate.find(selector));
      for (k = 0, len1 = ref.length; k < len1; k++) {
        elPair = ref[k];
        $(elPair[0]).replaceWith($(elPair[1]));
      }
    }
    this.delegateEvents();
    return this.$el.i18n();
  };

  CocoView.prototype.render = function() {
    var id, j, len, oldSubviews, ref, view;
    if (!me) {
      return this;
    }
    if (this.retainSubviews) {
      oldSubviews = _.values(this.subviews);
    } else {
      ref = this.subviews;
      for (id in ref) {
        view = ref[id];
        view.destroy();
      }
    }
    this.subviews = {};
    CocoView.__super__.render.call(this);
    if (_.isString(this.template)) {
      return this.template;
    }
    this.$el.html(this.template(this.getRenderData()));
    if (this.retainSubviews) {
      for (j = 0, len = oldSubviews.length; j < len; j++) {
        view = oldSubviews[j];
        this.insertSubView(view);
      }
    }
    if (!this.supermodel.finished()) {
      this.showLoading();
    } else {
      this.hideLoading();
    }
    this.afterRender();
    this.$el.i18n();
    return this;
  };

  CocoView.prototype.getRenderData = function(context) {
    if (context == null) {
      context = {};
    }
    context.isProduction = application.isProduction();
    context.me = me;
    context.pathname = document.location.pathname;
    context.fbRef = context.pathname.replace(/[^a-zA-Z0-9+\/=\-.:_]/g, '').slice(0, 40) || 'home';
    context.isMobile = this.isMobile();
    context.isIE = this.isIE();
    context.moment = moment;
    context.translate = $.i18n.t;
    context.view = this;
    context._ = _;
    context.document = document;
    context.i18n = utils.i18n;
    context.state = this.state;
    return context;
  };

  CocoView.prototype.afterRender = function() {
    return this.renderScrollbar();
  };

  CocoView.prototype.renderScrollbar = function() {
    return _.defer((function(_this) {
      return function() {
        if (!_this.destroyed) {
          return _this.$el.find('.nano').nanoScroller();
        }
      };
    })(this));
  };

  CocoView.prototype.updateProgress = function(progress) {
    if (progress > this.loadProgress.progress) {
      this.loadProgress.progress = progress;
    }
    return this.updateProgressBar(progress);
  };

  CocoView.prototype.updateProgressBar = function(progress) {
    var prog, ref;
    prog = (parseInt(progress * 100)) + "%";
    return (ref = this.$el) != null ? ref.find('.loading-container .progress-bar').css('width', prog) : void 0;
  };

  CocoView.prototype.onLoaded = function() {
    return this.render();
  };

  CocoView.prototype.onResourceLoadFailed = function(e) {
    var r, ref;
    r = e.resource;
    this.stopListening(this.supermodel);
    if (((ref = r.jqxhr) != null ? ref.status : void 0) === 402) {
      return;
    }
    return this.showError(r.jqxhr);
  };

  CocoView.prototype.warnConnectionError = function() {
    var msg;
    msg = $.i18n.t('loading_error.connection_failure', {
      defaultValue: 'Connection failed.'
    });
    return noty({
      text: msg,
      layout: 'center',
      type: 'error',
      killer: true,
      timeout: 3000
    });
  };

  CocoView.prototype.onClickContactModal = function(e) {
    var ContactModal;
    if (me.isTeacher()) {
      if (application.isProduction()) {
        return typeof window.Intercom === "function" ? window.Intercom('show') : void 0;
      } else {
        return alert('Teachers, Intercom widget only available in production.');
      }
    } else {
      ContactModal = require('views/core/ContactModal');
      return this.openModalView(new ContactModal());
    }
  };

  CocoView.prototype.onClickLoadingErrorLoginButton = function(e) {
    var AuthModal;
    e.stopPropagation();
    AuthModal = require('views/core/AuthModal');
    return this.openModalView(new AuthModal());
  };

  CocoView.prototype.onClickLoadingErrorCreateAccountButton = function(e) {
    var CreateAccountModal;
    e.stopPropagation();
    CreateAccountModal = require('views/core/CreateAccountModal');
    return this.openModalView(new CreateAccountModal({
      mode: 'signup'
    }));
  };

  CocoView.prototype.onClickLoadingErrorLogoutButton = function(e) {
    e.stopPropagation();
    return auth.logoutUser();
  };

  CocoView.lastToggleModalCall = 0;

  CocoView.prototype.toggleModal = function(e) {
    var Modal, elem, target;
    if ($(e.currentTarget).prop('target') === '_blank') {
      return true;
    }
    elem = $(e.target);
    if (elem.data('toggle') !== 'coco-modal') {
      return;
    }
    if (elem.attr('disabled')) {
      return;
    }
    target = elem.data('target');
    Modal = require('views/' + target);
    e.stopPropagation();
    return this.openModalView(new Modal({
      supermodel: this.supermodal
    }));
  };

  CocoView.prototype.openModalView = function(modalView, softly) {
    var modalOptions;
    if (softly == null) {
      softly = false;
    }
    if (waitingModal) {
      return;
    }
    if (visibleModal) {
      waitingModal = modalView;
      if (softly) {
        return;
      }
      if (visibleModal.$el.is(':visible')) {
        return visibleModal.hide();
      }
      return this.modalClosed(visibleModal);
    }
    modalView.render();
    $('#modal-wrapper').removeClass('hide').empty().append(modalView.el);
    modalView.afterInsert();
    visibleModal = modalView;
    modalOptions = {
      show: true,
      backdrop: modalView.closesOnClickOutside ? true : 'static'
    };
    $('#modal-wrapper .modal').modal(modalOptions).on('hidden.bs.modal', this.modalClosed);
    window.currentModal = modalView;
    this.getRootView().stopListeningToShortcuts(true);
    Backbone.Mediator.publish('modal:opened', {});
    return modalView;
  };

  CocoView.prototype.modalClosed = function() {
    var wm;
    if (visibleModal) {
      visibleModal.willDisappear();
    }
    visibleModal.destroy();
    visibleModal = null;
    window.currentModal = null;
    $('#modal-wrapper').addClass('hide');
    if (waitingModal) {
      wm = waitingModal;
      waitingModal = null;
      return this.openModalView(wm);
    } else {
      this.getRootView().listenToShortcuts(true);
      return Backbone.Mediator.publish('modal:closed', {});
    }
  };

  CocoView.prototype.showLoading = function($el) {
    if ($el == null) {
      $el = this.$el;
    }
    $el.find('>').addClass('hidden');
    $el.append(loadingScreenTemplate()).i18n();
    return this._lastLoading = $el;
  };

  CocoView.prototype.hideLoading = function() {
    if (this._lastLoading == null) {
      return;
    }
    this._lastLoading.find('.loading-screen').remove();
    this._lastLoading.find('>').removeClass('hidden');
    return this._lastLoading = null;
  };

  CocoView.prototype.showError = function(jqxhr) {
    var context;
    if (this._lastLoading == null) {
      return;
    }
    context = {
      jqxhr: jqxhr,
      view: this,
      me: me
    };
    this._lastLoading.find('.loading-screen').replaceWith(loadingErrorTemplate(context));
    return this._lastLoading.i18n();
  };

  CocoView.prototype.forumLink = function() {
    var lang, link;
    link = 'http://discourse.codecombat.com/';
    lang = (me.get('preferredLanguage') || 'en-US').split('-')[0];
    if (lang === 'zh' || lang === 'ru' || lang === 'es' || lang === 'fr' || lang === 'pt' || lang === 'de' || lang === 'nl' || lang === 'lt') {
      link += "c/other-languages/" + lang;
    }
    return link;
  };

  CocoView.prototype.showReadOnly = function() {
    var warning;
    if (me.isAdmin() || me.isArtisan()) {
      return;
    }
    warning = $.i18n.t('editor.read_only_warning2', {
      defaultValue: 'Note: you can\'t save any edits here, because you\'re not logged in.'
    });
    return noty({
      text: warning,
      layout: 'center',
      type: 'information',
      killer: true,
      timeout: 5000
    });
  };

  CocoView.prototype.enableModalInProgress = function(modal) {
    var el;
    el = modal.find('.modal-content');
    el.find('> div', modal).hide();
    return el.find('.wait', modal).show();
  };

  CocoView.prototype.disableModalInProgress = function(modal) {
    var el;
    el = modal.find('.modal-content');
    el.find('> div', modal).show();
    return el.find('.wait', modal).hide();
  };

  CocoView.prototype.addNewSubscription = CocoClass.prototype.addNewSubscription;

  CocoView.prototype.listenToShortcuts = function(recurse) {
    var func, ref, ref1, results, shortcut, view, viewID;
    if (!key) {
      return;
    }
    ref = this.shortcuts;
    for (shortcut in ref) {
      func = ref[shortcut];
      func = utils.normalizeFunc(func, this);
      key(shortcut, this.scope, _.bind(func, this));
    }
    if (recurse) {
      ref1 = this.subviews;
      results = [];
      for (viewID in ref1) {
        view = ref1[viewID];
        results.push(view.listenToShortcuts());
      }
      return results;
    }
  };

  CocoView.prototype.stopListeningToShortcuts = function(recurse) {
    var ref, results, view, viewID;
    if (!key) {
      return;
    }
    key.deleteScope(this.scope);
    if (recurse) {
      ref = this.subviews;
      results = [];
      for (viewID in ref) {
        view = ref[viewID];
        results.push(view.stopListeningToShortcuts());
      }
      return results;
    }
  };

  CocoView.prototype.insertSubView = function(view, elToReplace) {
    var key;
    if (elToReplace == null) {
      elToReplace = null;
    }
    key = this.makeSubViewKey(view);
    if (key in this.subviews) {
      this.subviews[key].destroy();
    }
    if (elToReplace == null) {
      elToReplace = this.$el.find('#' + view.id);
    }
    if (this.retainSubviews) {
      this.registerSubView(view, key);
      if (elToReplace[0]) {
        view.setElement(elToReplace[0]);
        view.render();
        view.afterInsert();
      }
      return view;
    } else {
      elToReplace.after(view.el).remove();
      this.registerSubView(view, key);
      view.render();
      view.afterInsert();
      return view;
    }
  };

  CocoView.prototype.registerSubView = function(view, key) {
    key = this.makeSubViewKey(view);
    view.parent = this;
    view.parentKey = key;
    this.subviews[key] = view;
    return view;
  };

  CocoView.prototype.makeSubViewKey = function(view) {
    var key;
    key = view.id || (view.constructor.name + classCount++);
    key = _.string.underscored(key);
    return key;
  };

  CocoView.prototype.removeSubView = function(view) {
    view.$el.empty();
    delete this.subviews[view.parentKey];
    return view.destroy();
  };

  CocoView.prototype.highlightElement = function(selector, options) {
    var $pointer, $target, delay, initialScale, offset, ref, targetLeft, targetTop;
    this.endHighlight();
    if (options == null) {
      options = {};
    }
    if (delay = options.delay) {
      delete options.delay;
      return this.pointerDelayTimeout = _.delay(((function(_this) {
        return function() {
          return _this.highlightElement(selector, options);
        };
      })(this)), delay);
    }
    $pointer = this.getPointer();
    $target = $(selector + ':visible');
    if (parseFloat($target.css('opacity')) === 0.0) {
      return;
    }
    if (!(offset = $target.offset())) {
      return;
    }
    targetLeft = offset.left + $target.outerWidth() * 0.5;
    targetTop = offset.top + $target.outerHeight() * 0.5;
    if (options.sides) {
      if (indexOf.call(options.sides, 'left') >= 0) {
        targetLeft = offset.left;
      }
      if (indexOf.call(options.sides, 'right') >= 0) {
        targetLeft = offset.left + $target.outerWidth();
      }
      if (indexOf.call(options.sides, 'top') >= 0) {
        targetTop = offset.top;
      }
      if (indexOf.call(options.sides, 'bottom') >= 0) {
        targetTop = offset.top + $target.outerHeight();
      }
    } else {
      if (offset.left > this.$el.outerWidth() * 0.5) {
        targetLeft = offset.left;
      } else if (offset.left + $target.outerWidth() < this.$el.outerWidth() * 0.5) {
        targetLeft = offset.left + $target.outerWidth();
      }
      if (offset.top > this.$el.outerWidth() * 0.5) {
        targetTop = offset.top;
      } else if (offset.top + $target.outerHeight() < this.$el.outerHeight() * 0.5) {
        targetTop = offset.top + $target.outerHeight();
      }
    }
    if (options.offset) {
      targetLeft += options.offset.x;
      targetTop += options.offset.y;
    }
    this.pointerRadialDistance = -47;
    this.pointerRotation = (ref = options.rotation) != null ? ref : Math.atan2(this.$el.outerWidth() * 0.5 - targetLeft, targetTop - this.$el.outerHeight() * 0.5);
    initialScale = Math.max(1, 20 - me.level());
    $pointer.css({
      opacity: 1.0,
      transition: 'none',
      transform: "rotate(" + this.pointerRotation + "rad) translate(-3px, " + this.pointerRadialDistance + "px) scale(" + initialScale + ")",
      top: targetTop - 50,
      left: targetLeft - 50
    });
    _.defer((function(_this) {
      return function() {
        if (_this.destroyed) {
          return;
        }
        _this.animatePointer();
        clearInterval(_this.pointerInterval);
        return _this.pointerInterval = setInterval(_this.animatePointer, 1200);
      };
    })(this));
    if (options.duration) {
      return this.pointerDurationTimeout = _.delay(((function(_this) {
        return function() {
          if (!_this.destroyed) {
            return _this.endHighlight();
          }
        };
      })(this)), options.duration);
    }
  };

  CocoView.prototype.animatePointer = function() {
    var $pointer;
    $pointer = this.getPointer();
    $pointer.css({
      transition: 'all 0.6s ease-out',
      transform: "rotate(" + this.pointerRotation + "rad) translate(-3px, " + (this.pointerRadialDistance - 50) + "px)"
    });
    return setTimeout(((function(_this) {
      return function() {
        return $pointer.css({
          transition: 'all 0.4s ease-in',
          transform: "rotate(" + _this.pointerRotation + "rad) translate(-3px, " + _this.pointerRadialDistance + "px)"
        });
      };
    })(this)), 800);
  };

  CocoView.prototype.endHighlight = function() {
    this.getPointer(false).css({
      'opacity': 0.0,
      'transition': 'none',
      top: '-50px',
      right: '-50px'
    });
    clearInterval(this.pointerInterval);
    clearTimeout(this.pointerDelayTimeout);
    clearTimeout(this.pointerDurationTimeout);
    return this.pointerInterval = this.pointerDelayTimeout = this.pointerDurationTimeout = null;
  };

  CocoView.prototype.getPointer = function(add) {
    var $pointer;
    if (add == null) {
      add = true;
    }
    if (($pointer = $(".highlight-pointer[data-cid='" + this.cid + "']")) && ($pointer.length || !add)) {
      return $pointer;
    }
    $pointer = $("<img src='/images/level/pointer.png' class='highlight-pointer' data-cid='" + this.cid + "'>");
    if (this.$el.parents('#modal-wrapper').length) {
      $pointer.css('z-index', 1040);
    }
    $('body').append($pointer);
    return $pointer;
  };

  CocoView.prototype.getQueryVariable = function(param, defaultValue) {
    return CocoView.getQueryVariable(param, defaultValue);
  };

  CocoView.getQueryVariable = function(param, defaultValue) {
    return utils.getQueryVariable(param, defaultValue);
  };

  CocoView.prototype.getRootView = function() {
    var view;
    view = this;
    while (view.parent != null) {
      view = view.parent;
    }
    return view;
  };

  CocoView.prototype.isMobile = function() {
    var ua;
    ua = navigator.userAgent || navigator.vendor || window.opera;
    return mobileRELong.test(ua) || mobileREShort.test(ua.substr(0, 4));
  };

  CocoView.prototype.isIE = function() {
    return navigator.userAgent.indexOf('MSIE') > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./);
  };

  CocoView.prototype.isMac = function() {
    return navigator.platform.toUpperCase().indexOf('MAC') !== -1;
  };

  CocoView.prototype.isIPadApp = function() {
    var ref;
    if (this._isIPadApp != null) {
      return this._isIPadApp;
    }
    return this._isIPadApp = ((typeof webkit !== "undefined" && webkit !== null ? webkit.messageHandlers : void 0) != null) && ((ref = navigator.userAgent) != null ? ref.indexOf('iPad') : void 0) !== -1;
  };

  CocoView.prototype.isIPadBrowser = function() {
    var ref;
    return (typeof navigator !== "undefined" && navigator !== null ? (ref = navigator.userAgent) != null ? ref.indexOf('iPad') : void 0 : void 0) !== -1;
  };

  CocoView.prototype.isFirefox = function() {
    return navigator.userAgent.toLowerCase().indexOf('firefox') !== -1;
  };

  CocoView.prototype.initSlider = function($el, startValue, changeCallback) {
    var slider;
    slider = $el.slider({
      animate: 'fast'
    });
    slider.slider('value', startValue);
    slider.on('slide', changeCallback);
    slider.on('slidechange', changeCallback);
    return slider;
  };

  CocoView.prototype.scrollToLink = function(link, speed) {
    var scrollTo;
    if (speed == null) {
      speed = 300;
    }
    scrollTo = $(link).offset().top;
    return $('html, body').animate({
      scrollTop: scrollTo
    }, speed);
  };

  CocoView.prototype.scrollToTop = function(speed) {
    if (speed == null) {
      speed = 300;
    }
    return $('html, body').animate({
      scrollTop: 0
    }, speed);
  };

  CocoView.prototype.toggleFullscreen = function(e) {
    var d, full, nah, req;
    full = document.fullscreenElement || document.mozFullScreenElement || document.mozFullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
    d = document.documentElement;
    if (!full) {
      req = d.requestFullScreen || d.mozRequestFullScreen || d.mozRequestFullscreen || d.msRequestFullscreen || (d.webkitRequestFullscreen ? function() {
        return d.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      } : null);
      if (req != null) {
        req.call(d);
      }
      if (req) {
        this.playSound('full-screen-start');
      }
    } else {
      nah = document.exitFullscreen || document.mozCancelFullScreen || document.mozCancelFullscreen || document.msExitFullscreen || document.webkitExitFullscreen;
      if (nah != null) {
        nah.call(document);
      }
      if (req) {
        this.playSound('full-screen-end');
      }
    }
  };

  CocoView.prototype.playSound = function(trigger, volume) {
    if (volume == null) {
      volume = 1;
    }
    return Backbone.Mediator.publish('audio-player:play-sound', {
      trigger: trigger,
      volume: volume
    });
  };

  CocoView.prototype.tryCopy = function() {
    var err, error, message;
    try {
      return document.execCommand('copy');
    } catch (error) {
      err = error;
      message = 'Oops, unable to copy';
      return noty({
        text: message,
        layout: 'topCenter',
        type: 'error',
        killer: false
      });
    }
  };

  CocoView.prototype.wait = function(event) {
    return new Promise((function(_this) {
      return function(resolve) {
        return _this.once(event, resolve);
      };
    })(this));
  };

  return CocoView;

})(Backbone.View);

mobileRELong = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i;

mobileREShort = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i;

module.exports = CocoView;
});

;require.register("views/core/ContactModal", function(exports, require, module) {
var ContactModal, ModalView, contactSchema, forms, sendContactMessage, template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ModalView = require('views/core/ModalView');

template = require('templates/core/contact');

forms = require('core/forms');

sendContactMessage = require('core/contact').sendContactMessage;

contactSchema = {
  additionalProperties: false,
  required: ['email', 'message'],
  properties: {
    email: {
      type: 'string',
      maxLength: 100,
      minLength: 1,
      format: 'email'
    },
    message: {
      type: 'string',
      minLength: 1
    }
  }
};

module.exports = ContactModal = (function(superClass) {
  extend(ContactModal, superClass);

  function ContactModal() {
    return ContactModal.__super__.constructor.apply(this, arguments);
  }

  ContactModal.prototype.id = 'contact-modal';

  ContactModal.prototype.template = template;

  ContactModal.prototype.closeButton = true;

  ContactModal.prototype.events = {
    'click #contact-submit-button': 'contact'
  };

  ContactModal.prototype.contact = function() {
    var contactMessage, ref, res;
    this.playSound('menu-button-click');
    forms.clearFormAlerts(this.$el);
    contactMessage = forms.formToObject(this.$el);
    res = tv4.validateMultiple(contactMessage, contactSchema);
    if (!res.valid) {
      return forms.applyErrorsToForm(this.$el, res.errors);
    }
    this.populateBrowserData(contactMessage);
    contactMessage = _.merge(contactMessage, this.options);
    contactMessage.country = me.get('country');
    if ((ref = window.tracker) != null) {
      ref.trackEvent('Sent Feedback', {
        message: contactMessage
      });
    }
    sendContactMessage(contactMessage, this.$el);
    return $.post("/db/user/" + me.id + "/track/contact_codecombat");
  };

  ContactModal.prototype.populateBrowserData = function(context) {
    var ref, ref1;
    if ($.browser) {
      context.browser = $.browser.platform + " " + $.browser.name + " " + $.browser.versionNumber;
    }
    context.screenSize = ((ref = typeof screen !== "undefined" && screen !== null ? screen.width : void 0) != null ? ref : $(window).width()) + " x " + ((ref1 = typeof screen !== "undefined" && screen !== null ? screen.height : void 0) != null ? ref1 : $(window).height());
    return context.screenshotURL = this.screenshotURL;
  };

  ContactModal.prototype.updateScreenshot = function() {
    var screenshotEl;
    if (!this.screenshotURL) {
      return;
    }
    screenshotEl = this.$el.find('#contact-screenshot').removeClass('secret');
    screenshotEl.find('a').prop('href', this.screenshotURL.replace("http://codecombat.com/", "/"));
    return screenshotEl.find('img').prop('src', this.screenshotURL.replace("http://codecombat.com/", "/"));
  };

  return ContactModal;

})(ModalView);
});

;require.register("views/core/CreateAccountModal/BasicInfoView", function(exports, require, module) {
var AuthModal, BasicInfoView, CocoView, State, User, errors, forms, template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoView = require('views/core/CocoView');

AuthModal = require('views/core/AuthModal');

template = require('templates/core/create-account-modal/basic-info-view');

forms = require('core/forms');

errors = require('core/errors');

User = require('models/User');

State = require('models/State');


/*
This view handles the primary form for user details — name, email, password, etc,
and the AJAX that actually creates the user.

It also handles facebook/g+ login, which if used, open one of two other screens:
sso-already-exists: If the facebook/g+ connection is already associated with a user, they're given a log in button
sso-confirm: If this is a new facebook/g+ connection, ask for a username, then allow creation of a user

The sso-confirm view *inherits from this view* in order to share its account-creation logic and events.
This means the selectors used in these events must work in both templates.

This view currently uses the old form API instead of stateful render.
It needs some work to make error UX and rendering better, but is functional.
 */

module.exports = BasicInfoView = (function(superClass) {
  extend(BasicInfoView, superClass);

  function BasicInfoView() {
    return BasicInfoView.__super__.constructor.apply(this, arguments);
  }

  BasicInfoView.prototype.id = 'basic-info-view';

  BasicInfoView.prototype.template = template;

  BasicInfoView.prototype.events = {
    'change input[name="email"]': 'onChangeEmail',
    'change input[name="name"]': 'onChangeName',
    'change input[name="password"]': 'onChangePassword',
    'click .back-button': 'onClickBackButton',
    'submit form': 'onSubmitForm',
    'click .use-suggested-name-link': 'onClickUseSuggestedNameLink',
    'click #facebook-signup-btn': 'onClickSsoSignupButton',
    'click #gplus-signup-btn': 'onClickSsoSignupButton'
  };

  BasicInfoView.prototype.initialize = function(arg) {
    this.signupState = (arg != null ? arg : {}).signupState;
    this.state = new State({
      suggestedNameText: '...',
      checkEmailState: 'standby',
      checkEmailValue: null,
      checkEmailPromise: null,
      checkNameState: 'standby',
      checkNameValue: null,
      checkNamePromise: null,
      error: ''
    });
    this.listenTo(this.state, 'change:checkEmailState', function() {
      return this.renderSelectors('.email-check');
    });
    this.listenTo(this.state, 'change:checkNameState', function() {
      return this.renderSelectors('.name-check');
    });
    this.listenTo(this.state, 'change:error', function() {
      return this.renderSelectors('.error-area');
    });
    this.listenTo(this.signupState, 'change:facebookEnabled', function() {
      return this.renderSelectors('.auth-network-logins');
    });
    return this.listenTo(this.signupState, 'change:gplusEnabled', function() {
      return this.renderSelectors('.auth-network-logins');
    });
  };

  BasicInfoView.prototype.updateAuthModalInitialValues = function(values) {
    return this.signupState.set({
      authModalInitialValues: _.merge(this.signupState.get('authModalInitialValues'), values)
    }, {
      silent: true
    });
  };

  BasicInfoView.prototype.onChangeEmail = function(e) {
    this.updateAuthModalInitialValues({
      email: this.$(e.currentTarget).val()
    });
    return this.checkEmail();
  };

  BasicInfoView.prototype.checkEmail = function() {
    var email;
    email = this.$('[name="email"]').val();
    if (this.signupState.get('path') !== 'student' && (!_.isEmpty(email) && email === this.state.get('checkEmailValue'))) {
      return this.state.get('checkEmailPromise');
    }
    if (!(email && forms.validateEmail(email))) {
      this.state.set({
        checkEmailState: 'standby',
        checkEmailValue: email,
        checkEmailPromise: null
      });
      return Promise.resolve();
    }
    this.state.set({
      checkEmailState: 'checking',
      checkEmailValue: email,
      checkEmailPromise: User.checkEmailExists(email).then((function(_this) {
        return function(arg) {
          var exists;
          exists = arg.exists;
          if (email !== _this.$('[name="email"]').val()) {
            return;
          }
          if (exists) {
            return _this.state.set('checkEmailState', 'exists');
          } else {
            return _this.state.set('checkEmailState', 'available');
          }
        };
      })(this))["catch"]((function(_this) {
        return function(e) {
          _this.state.set('checkEmailState', 'standby');
          throw e;
        };
      })(this))
    });
    return this.state.get('checkEmailPromise');
  };

  BasicInfoView.prototype.onChangeName = function(e) {
    this.updateAuthModalInitialValues({
      name: this.$(e.currentTarget).val()
    });
    return this.checkName();
  };

  BasicInfoView.prototype.checkName = function() {
    var name;
    name = this.$('input[name="name"]').val();
    if (name === this.state.get('checkNameValue')) {
      return this.state.get('checkNamePromise');
    }
    if (!name) {
      this.state.set({
        checkNameState: 'standby',
        checkNameValue: name,
        checkNamePromise: null
      });
      return Promise.resolve();
    }
    this.state.set({
      checkNameState: 'checking',
      checkNameValue: name,
      checkNamePromise: User.checkNameConflicts(name).then((function(_this) {
        return function(arg) {
          var conflicts, suggestedName, suggestedNameText;
          suggestedName = arg.suggestedName, conflicts = arg.conflicts;
          if (name !== _this.$('input[name="name"]').val()) {
            return;
          }
          if (conflicts) {
            suggestedNameText = $.i18n.t('signup.name_taken').replace('{{suggestedName}}', suggestedName);
            return _this.state.set({
              checkNameState: 'exists',
              suggestedNameText: suggestedNameText
            });
          } else {
            return _this.state.set({
              checkNameState: 'available'
            });
          }
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          _this.state.set('checkNameState', 'standby');
          throw error;
        };
      })(this))
    });
    return this.state.get('checkNamePromise');
  };

  BasicInfoView.prototype.onChangePassword = function(e) {
    return this.updateAuthModalInitialValues({
      password: this.$(e.currentTarget).val()
    });
  };

  BasicInfoView.prototype.checkBasicInfo = function(data) {
    var res;
    tv4.addFormat({
      'email': function(email) {
        if (forms.validateEmail(email)) {
          return null;
        } else {
          return {
            code: tv4.errorCodes.FORMAT_CUSTOM,
            message: "Please enter a valid email address."
          };
        }
      }
    });
    forms.clearFormAlerts(this.$el);
    if (data.name && forms.validateEmail(data.name)) {
      forms.setErrorToProperty(this.$el, 'name', $.i18n.t('signup.name_is_email'));
      return false;
    }
    res = tv4.validateMultiple(data, this.formSchema());
    if (!res.valid) {
      forms.applyErrorsToForm(this.$('form'), res.errors);
    }
    return res.valid;
  };

  BasicInfoView.prototype.formSchema = function() {
    return {
      type: 'object',
      properties: {
        email: User.schema.properties.email,
        name: User.schema.properties.name,
        password: User.schema.properties.password
      },
      required: ['name', 'password'].concat((this.signupState.get('path') === 'student' ? ['firstName', 'lastName'] : ['email']))
    };
  };

  BasicInfoView.prototype.onClickBackButton = function() {
    return this.trigger('nav-back');
  };

  BasicInfoView.prototype.onClickUseSuggestedNameLink = function(e) {
    this.$('input[name="name"]').val(this.state.get('suggestedName'));
    return forms.clearFormAlerts(this.$el.find('input[name="name"]').closest('.form-group').parent());
  };

  BasicInfoView.prototype.onSubmitForm = function(e) {
    var AbortError, data, valid;
    this.state.unset('error');
    e.preventDefault();
    data = forms.formToObject(e.currentTarget);
    valid = this.checkBasicInfo(data);
    if (!valid) {
      return;
    }
    this.displayFormSubmitting();
    AbortError = new Error();
    return this.checkEmail().then(this.checkName()).then((function(_this) {
      return function() {
        var emails, jqxhr, ref;
        if (!(((ref = _this.state.get('checkEmailState')) === 'available' || ref === 'standby') && _this.state.get('checkNameState') === 'available')) {
          throw AbortError;
        }
        emails = _.assign({}, me.get('emails'));
        if (emails.generalNews == null) {
          emails.generalNews = {};
        }
        emails.generalNews.enabled = _this.$('#subscribe-input').is(':checked') && !_.isEmpty(_this.state.get('checkEmailValue'));
        me.set('emails', emails);
        me.set(_.pick(data, 'firstName', 'lastName'));
        if (!_.isNaN(_this.signupState.get('birthday').getTime())) {
          me.set('birthday', _this.signupState.get('birthday').toISOString());
        }
        me.set(_.omit(_this.signupState.get('ssoAttrs') || {}, 'email', 'facebookID', 'gplusID'));
        jqxhr = me.save();
        if (!jqxhr) {
          console.error(me.validationError);
          throw new Error('Could not save user');
        }
        return new Promise(jqxhr.then);
      };
    })(this)).then((function(_this) {
      return function() {
        var email, facebookID, gplusID, jqxhr, name, password, ref, ref1, ref2, ref3;
        if ((ref = window.tracker) != null) {
          ref.identify();
        }
        switch (_this.signupState.get('ssoUsed')) {
          case 'gplus':
            ref1 = _this.signupState.get('ssoAttrs'), email = ref1.email, gplusID = ref1.gplusID;
            name = forms.formToObject(_this.$el).name;
            jqxhr = me.signupWithGPlus(name, email, gplusID);
            break;
          case 'facebook':
            ref2 = _this.signupState.get('ssoAttrs'), email = ref2.email, facebookID = ref2.facebookID;
            name = forms.formToObject(_this.$el).name;
            jqxhr = me.signupWithFacebook(name, email, facebookID);
            break;
          default:
            ref3 = forms.formToObject(_this.$el), name = ref3.name, email = ref3.email, password = ref3.password;
            jqxhr = me.signupWithPassword(name, email, password);
        }
        return new Promise(jqxhr.then);
      };
    })(this)).then((function(_this) {
      return function() {
        var classCode, classroom, ref;
        ref = _this.signupState.attributes, classCode = ref.classCode, classroom = ref.classroom;
        if (classCode && classroom) {
          return new Promise(classroom.joinWithCode(classCode).then);
        }
      };
    })(this)).then((function(_this) {
      return function() {
        return _this.finishSignup();
      };
    })(this))["catch"]((function(_this) {
      return function(e) {
        var ref;
        _this.displayFormStandingBy();
        if (e === AbortError) {

        } else {
          console.error('BasicInfoView form submission Promise error:', e);
          return _this.state.set('error', ((ref = e.responseJSON) != null ? ref.message : void 0) || 'Unknown Error');
        }
      };
    })(this));
  };

  BasicInfoView.prototype.finishSignup = function() {
    return this.trigger('signup');
  };

  BasicInfoView.prototype.displayFormSubmitting = function() {
    this.$('#create-account-btn').text($.i18n.t('signup.creating')).attr('disabled', true);
    return this.$('input').attr('disabled', true);
  };

  BasicInfoView.prototype.displayFormStandingBy = function() {
    this.$('#create-account-btn').text($.i18n.t('login.sign_up')).attr('disabled', false);
    return this.$('input').attr('disabled', false);
  };

  BasicInfoView.prototype.onClickSsoSignupButton = function(e) {
    var handler, ssoUsed;
    e.preventDefault();
    ssoUsed = $(e.currentTarget).data('sso-used');
    handler = ssoUsed === 'facebook' ? application.facebookHandler : application.gplusHandler;
    return handler.connect({
      context: this,
      success: function() {
        return handler.loadPerson({
          context: this,
          success: function(ssoAttrs) {
            var email;
            this.signupState.set({
              ssoAttrs: ssoAttrs
            });
            email = ssoAttrs.email;
            return User.checkEmailExists(email).then((function(_this) {
              return function(arg) {
                var exists;
                exists = arg.exists;
                _this.signupState.set({
                  ssoUsed: ssoUsed,
                  email: ssoAttrs.email
                });
                if (exists) {
                  return _this.trigger('sso-connect:already-in-use');
                } else {
                  return _this.trigger('sso-connect:new-user');
                }
              };
            })(this));
          }
        });
      }
    });
  };

  return BasicInfoView;

})(CocoView);
});

;require.register("views/core/CreateAccountModal/ChooseAccountTypeView", function(exports, require, module) {
var ChooseAccountTypeView, CocoView, template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoView = require('views/core/CocoView');

template = require('templates/core/create-account-modal/choose-account-type-view');

module.exports = ChooseAccountTypeView = (function(superClass) {
  extend(ChooseAccountTypeView, superClass);

  function ChooseAccountTypeView() {
    return ChooseAccountTypeView.__super__.constructor.apply(this, arguments);
  }

  ChooseAccountTypeView.prototype.id = 'choose-account-type-view';

  ChooseAccountTypeView.prototype.template = template;

  ChooseAccountTypeView.prototype.events = {
    'click .teacher-path-button': function() {
      return this.trigger('choose-path', 'teacher');
    },
    'click .student-path-button': function() {
      return this.trigger('choose-path', 'student');
    },
    'click .individual-path-button': function() {
      return this.trigger('choose-path', 'individual');
    }
  };

  return ChooseAccountTypeView;

})(CocoView);
});

;require.register("views/core/CreateAccountModal/ConfirmationView", function(exports, require, module) {
var CocoView, ConfirmationView, State, forms, template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoView = require('views/core/CocoView');

State = require('models/State');

template = require('templates/core/create-account-modal/confirmation-view');

forms = require('core/forms');

module.exports = ConfirmationView = (function(superClass) {
  extend(ConfirmationView, superClass);

  function ConfirmationView() {
    return ConfirmationView.__super__.constructor.apply(this, arguments);
  }

  ConfirmationView.prototype.id = 'confirmation-view';

  ConfirmationView.prototype.template = template;

  ConfirmationView.prototype.events = {
    'click #start-btn': 'onClickStartButton'
  };

  ConfirmationView.prototype.initialize = function(arg) {
    this.signupState = (arg != null ? arg : {}).signupState;
  };

  ConfirmationView.prototype.onClickStartButton = function() {
    var classroom;
    classroom = this.signupState.get('classroom');
    if (this.signupState.get('path') === 'student') {
      application.router.navigate('/', {
        replace: true
      });
      application.router.navigate('/students');
    } else {
      application.router.navigate('/play');
    }
    return document.location.reload();
  };

  return ConfirmationView;

})(CocoView);
});

;require.register("views/core/CreateAccountModal/CoppaDenyView", function(exports, require, module) {
var CocoView, CoppaDenyView, State, contact, forms, template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoView = require('views/core/CocoView');

State = require('models/State');

template = require('templates/core/create-account-modal/coppa-deny-view');

forms = require('core/forms');

contact = require('core/contact');

module.exports = CoppaDenyView = (function(superClass) {
  extend(CoppaDenyView, superClass);

  function CoppaDenyView() {
    return CoppaDenyView.__super__.constructor.apply(this, arguments);
  }

  CoppaDenyView.prototype.id = 'coppa-deny-view';

  CoppaDenyView.prototype.template = template;

  CoppaDenyView.prototype.events = {
    'click .send-parent-email-button': 'onClickSendParentEmailButton',
    'change input[name="parentEmail"]': 'onChangeParentEmail',
    'click .back-btn': 'onClickBackButton'
  };

  CoppaDenyView.prototype.initialize = function(arg) {
    this.signupState = (arg != null ? arg : {}).signupState;
    this.state = new State({
      parentEmail: ''
    });
    return this.listenTo(this.state, 'all', _.debounce(this.render));
  };

  CoppaDenyView.prototype.onChangeParentEmail = function(e) {
    return this.state.set({
      parentEmail: $(e.currentTarget).val()
    }, {
      silent: true
    });
  };

  CoppaDenyView.prototype.onClickSendParentEmailButton = function(e) {
    e.preventDefault();
    this.state.set({
      parentEmailSending: true
    });
    return contact.sendParentSignupInstructions(this.state.get('parentEmail')).then((function(_this) {
      return function() {
        return _this.state.set({
          error: false,
          parentEmailSent: true,
          parentEmailSending: false
        });
      };
    })(this))["catch"]((function(_this) {
      return function() {
        return _this.state.set({
          error: true,
          parentEmailSent: false,
          parentEmailSending: false
        });
      };
    })(this));
  };

  CoppaDenyView.prototype.onClickBackButton = function() {
    return this.trigger('nav-back');
  };

  return CoppaDenyView;

})(CocoView);
});

;require.register("views/core/CreateAccountModal/CreateAccountModal", function(exports, require, module) {
var AuthModal, BasicInfoView, ChooseAccountTypeView, ConfirmationView, CoppaDenyView, CreateAccountModal, ExtrasView, ModalView, SegmentCheckView, SingleSignOnAlreadyExistsView, SingleSignOnConfirmView, State, User, application, errors, forms, template, utils,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ModalView = require('views/core/ModalView');

AuthModal = require('views/core/AuthModal');

ChooseAccountTypeView = require('./ChooseAccountTypeView');

SegmentCheckView = require('./SegmentCheckView');

CoppaDenyView = require('./CoppaDenyView');

BasicInfoView = require('./BasicInfoView');

SingleSignOnAlreadyExistsView = require('./SingleSignOnAlreadyExistsView');

SingleSignOnConfirmView = require('./SingleSignOnConfirmView');

ExtrasView = require('./ExtrasView');

ConfirmationView = require('./ConfirmationView');

State = require('models/State');

template = require('templates/core/create-account-modal/create-account-modal');

forms = require('core/forms');

User = require('models/User');

application = require('core/application');

errors = require('core/errors');

utils = require('core/utils');


/*
CreateAccountModal is a wizard-style modal with several subviews, one for each
`screen` that the user navigates forward and back through.

There are three `path`s, one for each account type (individual, student).
Teacher account path will be added later; for now it defers to /teachers/signup)
Each subview handles only one `screen`, but all three `path` variants because
their logic is largely the same.

They `screen`s are:
  choose-account-type: Sets the `path`.
  segment-check: Checks required info for the path (age, )
    coppa-deny: Seen if the indidual segment-check age is < 13 years old
  basic-info: This is the form for username/password/email/etc.
              It asks for whatever is needed for this type of user.
              It also handles the actual user creation.
              A user may create their account here, or connect with facebook/g+
    sso-confirm: Alternate version of basic-info for new facebook/g+ users
  sso-already-exists: When facebook/g+ user already exists, this prompts them to sign in.
  extras: Not yet implemented
  confirmation: When an account has been successfully created, this view shows them their info and
    links them to a landing page based on their account type.

NOTE: BasicInfoView's two children (SingleSignOn...View) inherit from it.
This allows them to have the same form-handling logic, but different templates.
 */

module.exports = CreateAccountModal = (function(superClass) {
  extend(CreateAccountModal, superClass);

  function CreateAccountModal() {
    return CreateAccountModal.__super__.constructor.apply(this, arguments);
  }

  CreateAccountModal.prototype.id = 'create-account-modal';

  CreateAccountModal.prototype.template = template;

  CreateAccountModal.prototype.closesOnClickOutside = false;

  CreateAccountModal.prototype.retainSubviews = true;

  CreateAccountModal.prototype.events = {
    'click .login-link': 'onClickLoginLink'
  };

  CreateAccountModal.prototype.initialize = function(options) {
    var classCode, startOnPath;
    if (options == null) {
      options = {};
    }
    classCode = utils.getQueryVariable('_cc', void 0);
    this.signupState = new State({
      path: classCode ? 'student' : null,
      screen: classCode ? 'segment-check' : 'choose-account-type',
      ssoUsed: null,
      classroom: null,
      facebookEnabled: application.facebookHandler.apiLoaded,
      gplusEnabled: application.gplusHandler.apiLoaded,
      classCode: classCode,
      birthday: new Date(''),
      authModalInitialValues: {},
      accountCreated: false
    });
    startOnPath = options.startOnPath;
    if (startOnPath === 'student') {
      this.signupState.set({
        path: 'student',
        screen: 'segment-check'
      });
    }
    if (startOnPath === 'individual') {
      this.signupState.set({
        path: 'individual',
        screen: 'segment-check'
      });
    }
    this.listenTo(this.signupState, 'all', _.debounce(this.render));
    this.listenTo(this.insertSubView(new ChooseAccountTypeView()), {
      'choose-path': function(path) {
        if (path === 'teacher') {
          return application.router.navigate('/teachers/signup', {
            trigger: true
          });
        } else {
          return this.signupState.set({
            path: path,
            screen: 'segment-check'
          });
        }
      }
    });
    this.listenTo(this.insertSubView(new SegmentCheckView({
      signupState: this.signupState
    })), {
      'choose-path': function(path) {
        return this.signupState.set({
          path: path,
          screen: 'segment-check'
        });
      },
      'nav-back': function() {
        return this.signupState.set({
          path: null,
          screen: 'choose-account-type'
        });
      },
      'nav-forward': function(screen) {
        return this.signupState.set({
          screen: screen || 'basic-info'
        });
      }
    });
    this.listenTo(this.insertSubView(new CoppaDenyView({
      signupState: this.signupState
    })), {
      'nav-back': function() {
        return this.signupState.set({
          screen: 'segment-check'
        });
      }
    });
    this.listenTo(this.insertSubView(new BasicInfoView({
      signupState: this.signupState
    })), {
      'sso-connect:already-in-use': function() {
        return this.signupState.set({
          screen: 'sso-already-exists'
        });
      },
      'sso-connect:new-user': function() {
        return this.signupState.set({
          screen: 'sso-confirm'
        });
      },
      'nav-back': function() {
        return this.signupState.set({
          screen: 'segment-check'
        });
      },
      'signup': function() {
        if (this.signupState.get('path') === 'student') {
          return this.signupState.set({
            screen: 'extras',
            accountCreated: true
          });
        } else {
          return this.signupState.set({
            screen: 'confirmation',
            accountCreated: true
          });
        }
      }
    });
    this.listenTo(this.insertSubView(new SingleSignOnAlreadyExistsView({
      signupState: this.signupState
    })), {
      'nav-back': function() {
        return this.signupState.set({
          screen: 'basic-info'
        });
      }
    });
    this.listenTo(this.insertSubView(new SingleSignOnConfirmView({
      signupState: this.signupState
    })), {
      'nav-back': function() {
        return this.signupState.set({
          screen: 'basic-info'
        });
      },
      'signup': function() {
        if (this.signupState.get('path') === 'student') {
          return this.signupState.set({
            screen: 'extras',
            accountCreated: true
          });
        } else {
          return this.signupState.set({
            screen: 'confirmation',
            accountCreated: true
          });
        }
      }
    });
    this.listenTo(this.insertSubView(new ExtrasView({
      signupState: this.signupState
    })), {
      'nav-forward': function() {
        return this.signupState.set({
          screen: 'confirmation'
        });
      }
    });
    this.insertSubView(new ConfirmationView({
      signupState: this.signupState
    }));
    application.facebookHandler.loadAPI({
      success: (function(_this) {
        return function() {
          if (!_this.destroyed) {
            return _this.signupState.set({
              facebookEnabled: true
            });
          }
        };
      })(this)
    });
    application.gplusHandler.loadAPI({
      success: (function(_this) {
        return function() {
          if (!_this.destroyed) {
            return _this.signupState.set({
              gplusEnabled: true
            });
          }
        };
      })(this)
    });
    return this.once('hidden', function() {
      if (this.signupState.get('accountCreated') && !application.testing) {
        if (me.isStudent()) {
          application.router.navigate('/students', {
            trigger: true
          });
        } else if (me.isTeacher()) {
          application.router.navigate('/teachers/classes', {
            trigger: true
          });
        }
        return window.location.reload();
      }
    });
  };

  CreateAccountModal.prototype.onClickLoginLink = function() {
    return this.openModalView(new AuthModal({
      initialValues: this.signupState.get('authModalInitialValues')
    }));
  };

  return CreateAccountModal;

})(ModalView);
});

;require.register("views/core/CreateAccountModal/ExtrasView", function(exports, require, module) {
var CocoView, ExtrasView, HeroSelectView, State, template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoView = require('views/core/CocoView');

HeroSelectView = require('views/core/HeroSelectView');

template = require('templates/core/create-account-modal/extras-view');

State = require('models/State');

module.exports = ExtrasView = (function(superClass) {
  extend(ExtrasView, superClass);

  function ExtrasView() {
    return ExtrasView.__super__.constructor.apply(this, arguments);
  }

  ExtrasView.prototype.id = 'extras-view';

  ExtrasView.prototype.template = template;

  ExtrasView.prototype.retainSubviews = true;

  ExtrasView.prototype.events = {
    'click .next-button': function() {
      return this.trigger('nav-forward');
    }
  };

  ExtrasView.prototype.initialize = function(arg) {
    this.signupState = (arg != null ? arg : {}).signupState;
    return this.insertSubView(new HeroSelectView({
      showCurrentHero: false
    }));
  };

  return ExtrasView;

})(CocoView);
});

;require.register("views/core/CreateAccountModal/SegmentCheckView", function(exports, require, module) {
var Classroom, CocoView, SegmentCheckView, State, forms, template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoView = require('views/core/CocoView');

template = require('templates/core/create-account-modal/segment-check-view');

forms = require('core/forms');

Classroom = require('models/Classroom');

State = require('models/State');

module.exports = SegmentCheckView = (function(superClass) {
  extend(SegmentCheckView, superClass);

  function SegmentCheckView() {
    return SegmentCheckView.__super__.constructor.apply(this, arguments);
  }

  SegmentCheckView.prototype.id = 'segment-check-view';

  SegmentCheckView.prototype.template = template;

  SegmentCheckView.prototype.events = {
    'click .back-to-account-type': function() {
      return this.trigger('nav-back');
    },
    'input .class-code-input': 'onInputClassCode',
    'change .birthday-form-group': 'onInputBirthday',
    'submit form.segment-check': 'onSubmitSegmentCheck',
    'click .individual-path-button': function() {
      return this.trigger('choose-path', 'individual');
    }
  };

  SegmentCheckView.prototype.initialize = function(arg) {
    this.signupState = (arg != null ? arg : {}).signupState;
    this.checkClassCodeDebounced = _.debounce(this.checkClassCode, 1000);
    this.fetchClassByCode = _.memoize(this.fetchClassByCode);
    this.classroom = new Classroom();
    this.state = new State();
    if (this.signupState.get('classCode')) {
      this.checkClassCode(this.signupState.get('classCode'));
    }
    return this.listenTo(this.state, 'all', _.debounce(function() {
      this.renderSelectors('.render');
      return this.trigger('special-render');
    }));
  };

  SegmentCheckView.prototype.getClassCode = function() {
    return this.$('.class-code-input').val() || this.signupState.get('classCode');
  };

  SegmentCheckView.prototype.onInputClassCode = function() {
    var classCode;
    this.classroom = new Classroom();
    forms.clearFormAlerts(this.$el);
    classCode = this.getClassCode();
    this.signupState.set({
      classCode: classCode
    }, {
      silent: true
    });
    return this.checkClassCodeDebounced();
  };

  SegmentCheckView.prototype.checkClassCode = function() {
    var classCode;
    if (this.destroyed) {
      return;
    }
    classCode = this.getClassCode();
    return this.fetchClassByCode(classCode).then((function(_this) {
      return function(classroom) {
        if (_this.destroyed || _this.getClassCode() !== classCode) {
          return;
        }
        if (classroom) {
          _this.classroom = classroom;
          return _this.state.set({
            classCodeValid: true,
            segmentCheckValid: true
          });
        } else {
          _this.classroom = new Classroom();
          return _this.state.set({
            classCodeValid: false,
            segmentCheckValid: false
          });
        }
      };
    })(this))["catch"](function(error) {
      throw error;
    });
  };

  SegmentCheckView.prototype.onInputBirthday = function() {
    var birthday, birthdayDay, birthdayMonth, birthdayYear, ref;
    ref = forms.formToObject(this.$('form')), birthdayYear = ref.birthdayYear, birthdayMonth = ref.birthdayMonth, birthdayDay = ref.birthdayDay;
    birthday = new Date(Date.UTC(birthdayYear, birthdayMonth - 1, birthdayDay));
    this.signupState.set({
      birthdayYear: birthdayYear,
      birthdayMonth: birthdayMonth,
      birthdayDay: birthdayDay,
      birthday: birthday
    }, {
      silent: true
    });
    if (!_.isNaN(birthday.getTime())) {
      return forms.clearFormAlerts(this.$el);
    }
  };

  SegmentCheckView.prototype.onSubmitSegmentCheck = function(e) {
    var age;
    e.preventDefault();
    if (this.signupState.get('path') === 'student') {
      this.$('.class-code-input').attr('disabled', true);
      return this.fetchClassByCode(this.getClassCode()).then((function(_this) {
        return function(classroom) {
          if (_this.destroyed) {
            return;
          }
          if (classroom) {
            _this.signupState.set({
              classroom: classroom
            });
            return _this.trigger('nav-forward');
          } else {
            _this.$('.class-code-input').attr('disabled', false);
            _this.classroom = new Classroom();
            return _this.state.set({
              classCodeValid: false,
              segmentCheckValid: false
            });
          }
        };
      })(this))["catch"](function(error) {
        throw error;
      });
    } else if (this.signupState.get('path') === 'individual') {
      if (_.isNaN(this.signupState.get('birthday').getTime())) {
        forms.clearFormAlerts(this.$el);
        return forms.setErrorToProperty(this.$el, 'birthdayDay', 'Required');
      } else {
        age = (new Date().getTime() - this.signupState.get('birthday').getTime()) / 365.4 / 24 / 60 / 60 / 1000;
        if (age > 13) {
          return this.trigger('nav-forward');
        } else {
          return this.trigger('nav-forward', 'coppa-deny');
        }
      }
    }
  };

  SegmentCheckView.prototype.fetchClassByCode = function(classCode) {
    if (!classCode) {
      return Promise.resolve();
    }
    return new Promise(function(resolve, reject) {
      return new Classroom().fetchByCode(classCode, {
        success: resolve,
        error: function(classroom, jqxhr) {
          if (jqxhr.status === 404) {
            return resolve();
          } else {
            return reject(jqxhr.responseJSON);
          }
        }
      });
    });
  };

  return SegmentCheckView;

})(CocoView);
});

;require.register("views/core/CreateAccountModal/SingleSignOnAlreadyExistsView", function(exports, require, module) {
var CocoView, SingleSignOnAlreadyExistsView, User, forms, template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoView = require('views/core/CocoView');

template = require('templates/core/create-account-modal/single-sign-on-already-exists-view');

forms = require('core/forms');

User = require('models/User');

module.exports = SingleSignOnAlreadyExistsView = (function(superClass) {
  extend(SingleSignOnAlreadyExistsView, superClass);

  function SingleSignOnAlreadyExistsView() {
    return SingleSignOnAlreadyExistsView.__super__.constructor.apply(this, arguments);
  }

  SingleSignOnAlreadyExistsView.prototype.id = 'single-sign-on-already-exists-view';

  SingleSignOnAlreadyExistsView.prototype.template = template;

  SingleSignOnAlreadyExistsView.prototype.events = {
    'click .back-button': 'onClickBackButton'
  };

  SingleSignOnAlreadyExistsView.prototype.initialize = function(arg) {
    this.signupState = arg.signupState;
  };

  SingleSignOnAlreadyExistsView.prototype.onClickBackButton = function() {
    this.signupState.set({
      ssoUsed: void 0,
      ssoAttrs: void 0
    });
    return this.trigger('nav-back');
  };

  return SingleSignOnAlreadyExistsView;

})(CocoView);
});

;require.register("views/core/CreateAccountModal/SingleSignOnConfirmView", function(exports, require, module) {
var BasicInfoView, CocoView, SingleSignOnConfirmView, User, forms, template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoView = require('views/core/CocoView');

BasicInfoView = require('views/core/CreateAccountModal/BasicInfoView');

template = require('templates/core/create-account-modal/single-sign-on-confirm-view');

forms = require('core/forms');

User = require('models/User');

module.exports = SingleSignOnConfirmView = (function(superClass) {
  extend(SingleSignOnConfirmView, superClass);

  function SingleSignOnConfirmView() {
    return SingleSignOnConfirmView.__super__.constructor.apply(this, arguments);
  }

  SingleSignOnConfirmView.prototype.id = 'single-sign-on-confirm-view';

  SingleSignOnConfirmView.prototype.template = template;

  SingleSignOnConfirmView.prototype.events = _.extend({}, BasicInfoView.prototype.events, {
    'click .back-button': 'onClickBackButton'
  });

  SingleSignOnConfirmView.prototype.initialize = function(arg) {
    this.signupState = (arg != null ? arg : {}).signupState;
    return SingleSignOnConfirmView.__super__.initialize.apply(this, arguments);
  };

  SingleSignOnConfirmView.prototype.onClickBackButton = function() {
    this.signupState.set({
      ssoUsed: void 0,
      ssoAttrs: void 0
    });
    return this.trigger('nav-back');
  };

  SingleSignOnConfirmView.prototype.formSchema = function() {
    return {
      type: 'object',
      properties: {
        name: User.schema.properties.name
      },
      required: ['name']
    };
  };

  return SingleSignOnConfirmView;

})(BasicInfoView);
});

;require.register("views/core/CreateAccountModal/index", function(exports, require, module) {
module.exports = require('views/core/CreateAccountModal/CreateAccountModal');
});

;require.register("views/core/DiplomatSuggestionModal", function(exports, require, module) {
var DiplomatSuggestionModal, ModalView, forms, me, template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ModalView = require('views/core/ModalView');

template = require('templates/core/diplomat-suggestion');

me = require('core/auth').me;

forms = require('core/forms');

module.exports = DiplomatSuggestionModal = (function(superClass) {
  extend(DiplomatSuggestionModal, superClass);

  function DiplomatSuggestionModal() {
    return DiplomatSuggestionModal.__super__.constructor.apply(this, arguments);
  }

  DiplomatSuggestionModal.prototype.id = 'diplomat-suggestion-modal';

  DiplomatSuggestionModal.prototype.template = template;

  DiplomatSuggestionModal.prototype.events = {
    'click #subscribe-button': 'subscribeAsDiplomat'
  };

  DiplomatSuggestionModal.prototype.subscribeAsDiplomat = function() {
    me.setEmailSubscription('diplomatNews', true);
    me.patch();
    $('#email_translator').prop('checked', 1);
    this.hide();
    noty({
      text: $.i18n.t('account_settings.saved'),
      layout: 'topCenter',
      timeout: 5000,
      type: 'information'
    });
    return Backbone.Mediator.publish('router:navigate', {
      route: "/contribute/diplomat"
    });
  };

  return DiplomatSuggestionModal;

})(ModalView);
});

;require.register("views/core/HeroSelectView", function(exports, require, module) {
var Classroom, CocoView, HeroSelectView, State, ThangType, ThangTypes, User, template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoView = require('views/core/CocoView');

template = require('templates/core/hero-select-view');

Classroom = require('models/Classroom');

ThangTypes = require('collections/ThangTypes');

State = require('models/State');

ThangType = require('models/ThangType');

User = require('models/User');

module.exports = HeroSelectView = (function(superClass) {
  extend(HeroSelectView, superClass);

  function HeroSelectView() {
    return HeroSelectView.__super__.constructor.apply(this, arguments);
  }

  HeroSelectView.prototype.id = 'hero-select-view';

  HeroSelectView.prototype.template = template;

  HeroSelectView.prototype.events = {
    'click .hero-option': 'onClickHeroOption'
  };

  HeroSelectView.prototype.initialize = function(options) {
    var currentHeroOriginal, defaultHeroOriginal, ref;
    this.options = options != null ? options : {};
    defaultHeroOriginal = ThangType.heroes.captain;
    currentHeroOriginal = ((ref = me.get('heroConfig')) != null ? ref.thangType : void 0) || defaultHeroOriginal;
    this.debouncedRender = _.debounce(this.render, 0);
    this.state = new State({
      currentHeroOriginal: currentHeroOriginal,
      selectedHeroOriginal: currentHeroOriginal
    });
    this.heroes = new ThangTypes({}, {
      project: ['original', 'name', 'heroClass']
    });
    this.supermodel.trackRequest(this.heroes.fetchHeroes());
    this.listenTo(this.state, 'all', function() {
      return this.debouncedRender();
    });
    return this.listenTo(this.heroes, 'all', function() {
      return this.debouncedRender();
    });
  };

  HeroSelectView.prototype.onClickHeroOption = function(e) {
    var heroOriginal;
    heroOriginal = $(e.currentTarget).data('hero-original');
    this.state.set({
      selectedHeroOriginal: heroOriginal
    });
    return this.saveHeroSelection(heroOriginal);
  };

  HeroSelectView.prototype.saveHeroSelection = function(heroOriginal) {
    var hero, heroConfig;
    if (!me.get('heroConfig')) {
      me.set({
        heroConfig: {}
      });
    }
    heroConfig = _.assign(me.get('heroConfig'), {
      thangType: heroOriginal
    });
    me.set({
      heroConfig: heroConfig
    });
    hero = this.heroes.findWhere({
      original: heroOriginal
    });
    return me.save().then((function(_this) {
      return function() {
        return _this.trigger('hero-select:success', hero);
      };
    })(this));
  };

  return HeroSelectView;

})(CocoView);
});

;require.register("views/core/ModalView", function(exports, require, module) {
var CocoView, ModalView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoView = require('./CocoView');

module.exports = ModalView = (function(superClass) {
  extend(ModalView, superClass);

  ModalView.prototype.className = 'modal fade';

  ModalView.prototype.closeButton = true;

  ModalView.prototype.closesOnClickOutside = true;

  ModalView.prototype.modalWidthPercent = null;

  ModalView.prototype.plain = false;

  ModalView.prototype.instant = false;

  ModalView.prototype.template = require('templates/core/modal-base');

  ModalView.prototype.events = {
    'click a': 'toggleModal',
    'click button': 'toggleModal',
    'click li': 'toggleModal'
  };

  ModalView.prototype.shortcuts = {
    'esc': 'hide'
  };

  function ModalView(options) {
    if ((options != null ? options.instant : void 0) || this.instant) {
      this.className = this.className.replace(' fade', '');
    }
    if ((options != null ? options.closeButton : void 0) != null) {
      this.closeButton = options.closeButton;
    }
    if (options != null ? options.modalWidthPercent : void 0) {
      this.modalWidthPercent = options.modalWidthPercent;
    }
    ModalView.__super__.constructor.apply(this, arguments);
    if (this.options == null) {
      this.options = {};
    }
  }

  ModalView.prototype.subscriptions = {};

  ModalView.prototype.afterRender = function() {
    ModalView.__super__.afterRender.call(this);
    if (Backbone.history.fragment === "employers") {
      $(this.$el).find(".background-wrapper").each(function() {
        return $(this).addClass("employer-modal-background-wrapper").removeClass("background-wrapper");
      });
    }
    if (this.modalWidthPercent) {
      this.$el.find('.modal-dialog').css({
        width: this.modalWidthPercent + "%"
      });
    }
    this.$el.on('hide.bs.modal', (function(_this) {
      return function() {
        if (!_this.hidden) {
          _this.onHidden();
        }
        return _this.hidden = true;
      };
    })(this));
    if (this.plain) {
      return this.$el.find('.background-wrapper').addClass('plain');
    }
  };

  ModalView.prototype.afterInsert = function() {
    ModalView.__super__.afterInsert.call(this);
    return $(document.activeElement).blur();
  };

  ModalView.prototype.showLoading = function($el) {
    if (!$el) {
      $el = this.$el.find('.modal-body');
    }
    return ModalView.__super__.showLoading.call(this, $el);
  };

  ModalView.prototype.hide = function() {
    this.trigger('hide');
    if (!this.destroyed) {
      return this.$el.removeClass('fade').modal('hide');
    }
  };

  ModalView.prototype.onHidden = function() {
    return this.trigger('hidden');
  };

  ModalView.prototype.destroy = function() {
    if (!this.hidden) {
      this.hide();
    }
    this.$el.off('hide.bs.modal');
    return ModalView.__super__.destroy.call(this);
  };

  return ModalView;

})(CocoView);
});

;require.register("views/core/RecoverModal", function(exports, require, module) {
var ModalView, RecoverModal, filterKeyboardEvents, forms, genericFailure, template,
  slice = [].slice,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ModalView = require('views/core/ModalView');

template = require('templates/core/recover-modal');

forms = require('core/forms');

genericFailure = require('core/errors').genericFailure;

filterKeyboardEvents = function(allowedEvents, func) {
  return function() {
    var e, ref, splat;
    splat = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    e = splat[0];
    if (!((ref = e.keyCode, indexOf.call(allowedEvents, ref) >= 0) || !e.keyCode)) {
      return;
    }
    return func.apply(null, splat);
  };
};

module.exports = RecoverModal = (function(superClass) {
  extend(RecoverModal, superClass);

  RecoverModal.prototype.id = 'recover-modal';

  RecoverModal.prototype.template = template;

  RecoverModal.prototype.events = {
    'click #recover-button': 'recoverAccount',
    'keydown input': 'recoverAccount'
  };

  RecoverModal.prototype.subscriptions = {
    'errors:server-error': 'onServerError'
  };

  RecoverModal.prototype.onServerError = function(e) {
    return this.disableModalInProgress(this.$el);
  };

  function RecoverModal(options) {
    this.successfullyRecovered = bind(this.successfullyRecovered, this);
    this.recoverAccount = bind(this.recoverAccount, this);
    this.recoverAccount = filterKeyboardEvents([13], this.recoverAccount);
    RecoverModal.__super__.constructor.call(this, options);
  }

  RecoverModal.prototype.recoverAccount = function(e) {
    var email, res;
    this.playSound('menu-button-click');
    forms.clearFormAlerts(this.$el);
    email = (forms.formToObject(this.$el)).email;
    if (!email) {
      return;
    }
    res = $.post('/auth/reset', {
      email: email
    }, this.successfullyRecovered);
    res.fail(genericFailure);
    return this.enableModalInProgress(this.$el);
  };

  RecoverModal.prototype.successfullyRecovered = function() {
    this.disableModalInProgress(this.$el);
    this.$el.find('.modal-body:visible').text($.i18n.t('recover.recovery_sent'));
    return this.$el.find('.modal-footer').remove();
  };

  return RecoverModal;

})(ModalView);
});

;require.register("views/core/RootView", function(exports, require, module) {
var Achievement, AchievementPopup, CocoView, RootView, filterKeyboardEvents, locale, logoutUser, me, ref, utils,
  slice = [].slice,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CocoView = require('./CocoView');

ref = require('core/auth'), logoutUser = ref.logoutUser, me = ref.me;

locale = require('locale/locale');

Achievement = require('models/Achievement');

AchievementPopup = require('views/core/AchievementPopup');

utils = require('core/utils');

filterKeyboardEvents = function(allowedEvents, func) {
  return function() {
    var e, ref1, splat;
    splat = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    e = splat[0];
    if (!((ref1 = e.keyCode, indexOf.call(allowedEvents, ref1) >= 0) || !e.keyCode)) {
      return;
    }
    return func.apply(null, splat);
  };
};

module.exports = RootView = (function(superClass) {
  extend(RootView, superClass);

  function RootView() {
    return RootView.__super__.constructor.apply(this, arguments);
  }

  RootView.prototype.showBackground = true;

  RootView.prototype.events = {
    'click #logout-button': 'logoutAccount',
    'change .language-dropdown': 'onLanguageChanged',
    'click .toggle-fullscreen': 'toggleFullscreen',
    'click .signup-button': 'onClickSignupButton',
    'click .login-button': 'onClickLoginButton',
    'click a': 'onClickAnchor',
    'click button': 'toggleModal',
    'click li': 'toggleModal',
    'treema-error': 'onTreemaError'
  };

  RootView.prototype.subscriptions = {
    'achievements:new': 'handleNewAchievements',
    'modal:open-modal-view': 'onOpenModalView'
  };

  RootView.prototype.shortcuts = {
    'ctrl+shift+a': 'navigateToAdmin'
  };

  RootView.prototype.showNewAchievement = function(achievement, earnedAchievement) {
    var ref1;
    earnedAchievement.set('notified', true);
    earnedAchievement.patch();
    if (achievement.get('collection') === 'level.sessions' && !((ref1 = achievement.get('query')) != null ? ref1.team : void 0)) {
      return;
    }
    if (window.serverConfig.picoCTF) {
      return;
    }
    if (achievement.get('hidden')) {
      return;
    }
    return new AchievementPopup({
      achievement: achievement,
      earnedAchievement: earnedAchievement
    });
  };

  RootView.prototype.handleNewAchievements = function(e) {
    return _.each(e.earnedAchievements.models, (function(_this) {
      return function(earnedAchievement) {
        var achievement;
        achievement = new Achievement({
          _id: earnedAchievement.get('achievement')
        });
        return achievement.fetch({
          success: function(achievement) {
            return typeof _this.showNewAchievement === "function" ? _this.showNewAchievement(achievement, earnedAchievement) : void 0;
          },
          cache: false
        });
      };
    })(this));
  };

  RootView.prototype.logoutAccount = function() {
    var ref1, ref2, ref3, ref4;
    if (window.application.isIPadApp) {
      if (typeof window !== "undefined" && window !== null) {
        if ((ref1 = window.webkit) != null) {
          if ((ref2 = ref1.messageHandlers) != null) {
            if ((ref3 = ref2.notification) != null) {
              ref3.postMessage({
                name: "signOut"
              });
            }
          }
        }
      }
    }
    Backbone.Mediator.publish("auth:logging-out", {});
    if (this.id === 'home-view') {
      if ((ref4 = window.tracker) != null) {
        ref4.trackEvent('Log Out', {
          category: 'Homepage'
        }, ['Google Analytics']);
      }
    }
    return logoutUser($('#login-email').val());
  };

  RootView.prototype.onClickSignupButton = function() {
    var CreateAccountModal, ref1, ref2, ref3;
    CreateAccountModal = require('views/core/CreateAccountModal');
    switch (this.id) {
      case 'home-view':
        if ((ref1 = window.tracker) != null) {
          ref1.trackEvent('Started Signup', {
            category: 'Homepage',
            label: 'Homepage'
          });
        }
        break;
      case 'world-map-view':
        if ((ref2 = window.tracker) != null) {
          ref2.trackEvent('Started Signup', {
            category: 'World Map',
            label: 'World Map'
          });
        }
        break;
      default:
        if ((ref3 = window.tracker) != null) {
          ref3.trackEvent('Started Signup', {
            label: this.id
          });
        }
    }
    return this.openModalView(new CreateAccountModal());
  };

  RootView.prototype.onClickLoginButton = function() {
    var AuthModal, ref1;
    AuthModal = require('views/core/AuthModal');
    if (this.id === 'home-view') {
      if ((ref1 = window.tracker) != null) {
        ref1.trackEvent('Login', {
          category: 'Homepage'
        }, ['Google Analytics']);
      }
    }
    return this.openModalView(new AuthModal());
  };

  RootView.prototype.onClickAnchor = function(e) {
    var anchorText, ref1, ref2;
    if (this.destroyed) {
      return;
    }
    anchorText = e != null ? (ref1 = e.currentTarget) != null ? ref1.text : void 0 : void 0;
    if (this.id === 'home-view' && anchorText) {
      if ((ref2 = window.tracker) != null) {
        ref2.trackEvent(anchorText, {
          category: 'Homepage'
        }, ['Google Analytics']);
      }
    }
    return this.toggleModal(e);
  };

  RootView.prototype.onOpenModalView = function(e) {
    var ModalClass;
    if (!(e.modalPath && (ModalClass = require(e.modalPath)))) {
      return console.error("Couldn't find modalPath " + e.modalPath);
    }
    return this.openModalView(new ModalClass({}));
  };

  RootView.prototype.showLoading = function($el) {
    if ($el == null) {
      $el = this.$el.find('#site-content-area');
    }
    return RootView.__super__.showLoading.call(this, $el);
  };

  RootView.prototype.afterInsert = function() {
    RootView.__super__.afterInsert.call(this);
    return this.renderScrollbar();
  };

  RootView.prototype.afterRender = function() {
    var title;
    if (this.$el.find('#site-nav').length) {
      this.$el.addClass('site-chrome');
      if (this.showBackground) {
        this.$el.addClass('show-background');
      }
    }
    RootView.__super__.afterRender.apply(this, arguments);
    if (location.hash) {
      this.chooseTab(location.hash.replace('#', ''));
    }
    this.buildLanguages();
    $('body').removeClass('is-playing');
    if (title = this.getTitle()) {
      title += ' | CodeCombat';
    } else {
      title = 'CodeCombat - Learn how to code by playing a game';
    }
    return $('title').text(title);
  };

  RootView.prototype.getTitle = function() {
    return '';
  };

  RootView.prototype.chooseTab = function(category) {
    return $("a[href='#" + category + "']", this.$el).tab('show');
  };

  RootView.prototype.buildLanguages = function() {
    var $select, preferred;
    $select = this.$el.find('.language-dropdown').empty();
    preferred = me.get('preferredLanguage', true);
    this.addLanguagesToSelect($select, preferred);
    return $('body').attr('lang', preferred);
  };

  RootView.prototype.addLanguagesToSelect = function($select, initialVal) {
    var code, codes, genericCodes, localeInfo;
    if (initialVal == null) {
      initialVal = me.get('preferredLanguage', true);
    }
    codes = _.keys(locale);
    genericCodes = _.filter(codes, function(code) {
      return _.find(codes, function(code2) {
        return code2 !== code && code2.split('-')[0] === code;
      });
    });
    for (code in locale) {
      localeInfo = locale[code];
      if (!(code !== 'update' && (!(indexOf.call(genericCodes, code) >= 0) || code === initialVal))) {
        continue;
      }
      $select.append($('<option></option>').val(code).text(localeInfo.nativeDescription));
      if (code === 'fr') {
        $select.append($('<option class="select-dash" disabled="disabled"></option>').text('----------------------------------'));
      }
    }
    return $select.val(initialVal);
  };

  RootView.prototype.onLanguageChanged = function() {
    var loading, newLang;
    newLang = $('.language-dropdown').val();
    $.i18n.setLng(newLang, {});
    this.saveLanguage(newLang);
    loading = application.moduleLoader.loadLanguage(me.get('preferredLanguage', true));
    if (loading) {
      return this.listenToOnce(application.moduleLoader, 'load-complete', this.onLanguageLoaded);
    } else {
      return this.onLanguageLoaded();
    }
  };

  RootView.prototype.onLanguageLoaded = function() {
    var DiplomatModal;
    this.render();
    if (me.get('preferredLanguage').split('-')[0] !== 'en') {
      DiplomatModal = require('views/core/DiplomatSuggestionModal');
      return this.openModalView(new DiplomatModal());
    }
  };

  RootView.prototype.saveLanguage = function(newLang) {
    var res;
    me.set('preferredLanguage', newLang);
    res = me.patch();
    if (!res) {
      return;
    }
    res.error(function() {
      var errors;
      errors = JSON.parse(res.responseText);
      return console.warn('Error saving language:', errors);
    });
    return res.success(function(model, response, options) {});
  };

  RootView.prototype.isOldBrowser = function() {
    var majorVersion;
    if ($.browser) {
      majorVersion = $.browser.versionNumber;
      if ($.browser.mozilla && majorVersion < 25) {
        return true;
      }
      if ($.browser.chrome && majorVersion < 31) {
        return true;
      }
      if ($.browser.safari && majorVersion < 6) {
        return true;
      }
    } else {
      console.warn('no more jquery browser version...');
    }
    return false;
  };

  RootView.prototype.logoutRedirectURL = '/';

  RootView.prototype.navigateToAdmin = function() {
    if (window.amActually || me.isAdmin()) {
      return application.router.navigate('/admin', {
        trigger: true
      });
    }
  };

  RootView.prototype.onTreemaError = function(e) {
    return noty({
      text: e.message,
      layout: 'topCenter',
      type: 'error',
      killer: false,
      timeout: 5000,
      dismissQueue: true
    });
  };

  return RootView;

})(CocoView);
});

;require.register("views/core/SubscribeModal", function(exports, require, module) {
var CreateAccountModal, ModalView, Products, SubscribeModal, stripeHandler, template, utils,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ModalView = require('views/core/ModalView');

template = require('templates/core/subscribe-modal');

stripeHandler = require('core/services/stripe');

utils = require('core/utils');

CreateAccountModal = require('views/core/CreateAccountModal');

Products = require('collections/Products');

module.exports = SubscribeModal = (function(superClass) {
  extend(SubscribeModal, superClass);

  SubscribeModal.prototype.id = 'subscribe-modal';

  SubscribeModal.prototype.template = template;

  SubscribeModal.prototype.plain = true;

  SubscribeModal.prototype.closesOnClickOutside = false;

  SubscribeModal.prototype.planID = 'basic';

  SubscribeModal.prototype.i18nData = {
    levelsCount: '145',
    worldsCount: '5',
    heroesCount: '14',
    bonusLevelsCount: '95'
  };

  SubscribeModal.prototype.subscriptions = {
    'stripe:received-token': 'onStripeReceivedToken'
  };

  SubscribeModal.prototype.events = {
    'click #close-modal': 'hide',
    'click .popover-content .parent-send': 'onClickParentSendButton',
    'click .email-parent-complete button': 'onClickParentEmailCompleteButton',
    'click .purchase-button': 'onClickPurchaseButton',
    'click .sale-button': 'onClickSaleButton'
  };

  function SubscribeModal(options) {
    SubscribeModal.__super__.constructor.call(this, options);
    this.state = 'standby';
    this.products = new Products();
    this.supermodel.loadCollection(this.products, 'products');
  }

  SubscribeModal.prototype.onLoaded = function() {
    var countrySpecificProduct;
    this.basicProduct = this.products.findWhere({
      name: 'basic_subscription'
    });
    this.yearProduct = this.products.findWhere({
      name: 'year_subscription'
    });
    if (countrySpecificProduct = this.products.findWhere({
      name: (me.get('country')) + "_basic_subscription"
    })) {
      this.basicProduct = countrySpecificProduct;
      this.yearProduct = this.products.findWhere({
        name: (me.get('country')) + "_year_subscription"
      });
    }
    return SubscribeModal.__super__.onLoaded.call(this);
  };

  SubscribeModal.prototype.afterRender = function() {
    SubscribeModal.__super__.afterRender.call(this);
    this.setupParentButtonPopover();
    this.setupParentInfoPopover();
    this.setupPaymentMethodsInfoPopover();
    if (this.basicProduct) {
      this.$el.find('.gem-amount').html($.i18n.t('subscribe.feature4').replace('{{gems}}', this.basicProduct.get('gems')));
    }
    return this.playSound('game-menu-open');
  };

  SubscribeModal.prototype.setupParentButtonPopover = function() {
    var popoverContent, popoverTitle;
    popoverTitle = $.i18n.t('subscribe.parent_email_title');
    popoverTitle += '<button type="button" class="close" onclick="$(&#39;.parent-button&#39;).popover(&#39;hide&#39;);">&times;</button>';
    popoverContent = function() {
      return $('.parent-button-popover-content').html();
    };
    return this.$el.find('.parent-button').popover({
      animation: true,
      html: true,
      placement: 'top',
      trigger: 'click',
      title: popoverTitle,
      content: popoverContent,
      container: this.$el
    }).on('shown.bs.popover', (function(_this) {
      return function() {
        var ref;
        return (ref = application.tracker) != null ? ref.trackEvent('Subscription ask parent button click') : void 0;
      };
    })(this));
  };

  SubscribeModal.prototype.setupParentInfoPopover = function() {
    var levelsCompleted, popoverContent, popoverTitle, price, ref;
    if (!this.products.size()) {
      return;
    }
    popoverTitle = $.i18n.t('subscribe.parents_title');
    levelsCompleted = ((ref = me.get('stats')) != null ? ref.gamesCompleted : void 0) || 'several';
    popoverContent = "<p>" + $.i18n.t('subscribe.parents_blurb1', {
      nLevels: levelsCompleted
    }) + "</p>";
    popoverContent += "<p>" + $.i18n.t('subscribe.parents_blurb1a') + "</p>";
    popoverContent += "<p>" + $.i18n.t('subscribe.parents_blurb2') + "</p>";
    price = (this.basicProduct.get('amount') / 100).toFixed(2);
    popoverContent = popoverContent.replace('{{price}}', price);
    popoverContent += "<p>" + $.i18n.t('subscribe.parents_blurb3') + "</p>";
    return this.$el.find('#parents-info').popover({
      animation: true,
      html: true,
      placement: 'top',
      trigger: 'hover',
      title: popoverTitle,
      content: popoverContent,
      container: this.$el
    }).on('shown.bs.popover', (function(_this) {
      return function() {
        var ref1;
        return (ref1 = application.tracker) != null ? ref1.trackEvent('Subscription parent hover') : void 0;
      };
    })(this));
  };

  SubscribeModal.prototype.setupPaymentMethodsInfoPopover = function() {
    var popoverContent, popoverTitle, threeMonthPrice, yearPrice;
    if (!this.products.size()) {
      return;
    }
    popoverTitle = $.i18n.t('subscribe.payment_methods_title');
    threeMonthPrice = (this.basicProduct.get('amount') * 3 / 100).toFixed(2);
    if (this.yearProduct) {
      yearPrice = (this.yearProduct.get('amount') / 100).toFixed(2);
    } else {
      yearPrice = (this.basicProduct.get('amount') * 12 / 100).toFixed(2);
    }
    popoverTitle += '<button type="button" class="close" onclick="$(&#39;#payment-methods-info&#39;).popover(&#39;hide&#39;);">&times;</button>';
    popoverContent = "<p>" + $.i18n.t('subscribe.payment_methods_blurb1') + "</p>";
    popoverContent = popoverContent.replace('{{three_month_price}}', threeMonthPrice);
    popoverContent = popoverContent.replace('{{year_price}}', yearPrice);
    popoverContent += "<p>" + $.i18n.t('subscribe.payment_methods_blurb2') + " <a href='mailto:support@codecombat.com'>support@codecombat.com</a>.";
    return this.$el.find('#payment-methods-info').popover({
      animation: true,
      html: true,
      placement: 'top',
      trigger: 'click',
      title: popoverTitle,
      content: popoverContent,
      container: this.$el
    }).on('shown.bs.popover', (function(_this) {
      return function() {
        var ref;
        return (ref = application.tracker) != null ? ref.trackEvent('Subscription payment methods hover') : void 0;
      };
    })(this));
  };

  SubscribeModal.prototype.onClickParentSendButton = function(e) {
    var email, request;
    email = this.$el.find('.popover-content .parent-input').val();
    if (!/[\w\.]+@\w+\.\w+/.test(email)) {
      this.$el.find('.popover-content .parent-input').parent().addClass('has-error');
      this.$el.find('.popover-content .parent-email-validator').show();
      return false;
    }
    request = this.supermodel.addRequestResource('send_one_time_email', {
      url: '/db/user/-/send_one_time_email',
      data: {
        email: email,
        type: 'subscribe modal parent'
      },
      method: 'POST'
    }, 0);
    request.load();
    this.$el.find('.popover-content .email-parent-form').hide();
    this.$el.find('.popover-content .email-parent-complete').show();
    return false;
  };

  SubscribeModal.prototype.onClickParentEmailCompleteButton = function(e) {
    return this.$el.find('.parent-button').popover('hide');
  };

  SubscribeModal.prototype.onClickPurchaseButton = function(e) {
    var options, ref;
    if (!this.basicProduct) {
      return;
    }
    this.playSound('menu-button-click');
    if (me.get('anonymous')) {
      return this.openModalView(new CreateAccountModal());
    }
    if ((ref = application.tracker) != null) {
      ref.trackEvent('Started subscription purchase');
    }
    options = {
      description: $.i18n.t('subscribe.stripe_description'),
      amount: this.basicProduct.get('amount'),
      alipay: me.get('country') === 'china' || (me.get('preferredLanguage') || 'en-US').slice(0, 2) === 'zh' ? true : 'auto',
      alipayReusable: true
    };
    this.purchasedAmount = options.amount;
    return stripeHandler.open(options);
  };

  SubscribeModal.prototype.onClickSaleButton = function(e) {
    var discount, discountString, options, ref;
    this.playSound('menu-button-click');
    if (me.get('anonymous')) {
      return this.openModalView(new CreateAccountModal());
    }
    if ((ref = application.tracker) != null) {
      ref.trackEvent('Started 1 year subscription purchase');
    }
    discount = this.basicProduct.get('amount') * 12 - this.yearProduct.get('amount');
    discountString = (discount / 100).toFixed(2);
    options = {
      description: $.i18n.t('subscribe.stripe_description_year_sale').replace('{{discount}}', discountString),
      amount: this.yearProduct.get('amount'),
      alipay: me.get('country') === 'china' || (me.get('preferredLanguage') || 'en-US').slice(0, 2) === 'zh' ? true : 'auto',
      alipayReusable: true
    };
    this.purchasedAmount = options.amount;
    return stripeHandler.open(options);
  };

  SubscribeModal.prototype.onStripeReceivedToken = function(e) {
    var data, jqxhr, ref, stripe;
    this.state = 'purchasing';
    this.render();
    if (this.purchasedAmount === this.basicProduct.get('amount')) {
      stripe = _.clone((ref = me.get('stripe')) != null ? ref : {});
      stripe.planID = this.basicProduct.get('planID');
      stripe.token = e.token.id;
      me.set('stripe', stripe);
      this.listenToOnce(me, 'sync', this.onSubscriptionSuccess);
      this.listenToOnce(me, 'error', this.onSubscriptionError);
      return me.patch({
        headers: {
          'X-Change-Plan': 'true'
        }
      });
    } else if (this.purchasedAmount === this.yearProduct.get('amount')) {
      data = {
        stripe: {
          token: e.token.id,
          timestamp: new Date().getTime()
        }
      };
      jqxhr = $.post('/db/subscription/-/year_sale', data);
      jqxhr.done((function(_this) {
        return function(data, textStatus, jqXHR) {
          var ref1;
          if ((ref1 = application.tracker) != null) {
            ref1.trackEvent('Finished 1 year subscription purchase', {
              value: _this.purchasedAmount
            });
          }
          if ((data != null ? data.stripe : void 0) != null) {
            me.set('stripe', data != null ? data.stripe : void 0);
          }
          Backbone.Mediator.publish('subscribe-modal:subscribed', {});
          _this.playSound('victory');
          return _this.hide();
        };
      })(this));
      return jqxhr.fail((function(_this) {
        return function(xhr, textStatus, errorThrown) {
          var ref1, ref2;
          console.error('We got an error subscribing with Stripe from our server:', textStatus, errorThrown);
          if ((ref1 = application.tracker) != null) {
            ref1.trackEvent('Failed to finish 1 year subscription purchase', {
              status: textStatus,
              value: _this.purchasedAmount
            });
          }
          stripe = (ref2 = me.get('stripe')) != null ? ref2 : {};
          delete stripe.token;
          delete stripe.planID;
          if (xhr.status === 402) {
            _this.state = 'declined';
          } else {
            _this.state = 'unknown_error';
            _this.stateMessage = xhr.status + ": " + xhr.responseText;
          }
          return _this.render();
        };
      })(this));
    } else {
      console.error("Unexpected purchase amount received", this.purchasedAmount, e);
      this.state = 'unknown_error';
      return this.stateMessage = "Uknown problem occurred while processing Stripe request";
    }
  };

  SubscribeModal.prototype.onSubscriptionSuccess = function() {
    var ref;
    if ((ref = application.tracker) != null) {
      ref.trackEvent('Finished subscription purchase', {
        value: this.purchasedAmount
      });
    }
    Backbone.Mediator.publish('subscribe-modal:subscribed', {});
    this.playSound('victory');
    return this.hide();
  };

  SubscribeModal.prototype.onSubscriptionError = function(user, response, options) {
    var ref, ref1, ref2, stripe, xhr;
    console.error('We got an error subscribing with Stripe from our server:', response);
    if ((ref = application.tracker) != null) {
      ref.trackEvent('Failed to finish subscription purchase', {
        status: (ref1 = options.xhr) != null ? ref1.status : void 0,
        value: this.purchasedAmount
      });
    }
    stripe = (ref2 = me.get('stripe')) != null ? ref2 : {};
    delete stripe.token;
    delete stripe.planID;
    xhr = options.xhr;
    if (xhr.status === 402) {
      this.state = 'declined';
    } else {
      this.state = 'unknown_error';
      this.stateMessage = xhr.status + ": " + xhr.responseText;
    }
    return this.render();
  };

  SubscribeModal.prototype.onHidden = function() {
    SubscribeModal.__super__.onHidden.call(this);
    return this.playSound('game-menu-close');
  };

  return SubscribeModal;

})(ModalView);
});

;require.register("locale/locale", function(exports, require, module) {
module.exports = {
  update: function() {
    var code, i, len, localesLoaded, path, results, s;
    localesLoaded = (function() {
      var i, len, ref, results;
      ref = window.require.list();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        s = ref[i];
        if (_.string.startsWith(s, 'locale/')) {
          results.push(s);
        }
      }
      return results;
    })();
    results = [];
    for (i = 0, len = localesLoaded.length; i < len; i++) {
      path = localesLoaded[i];
      if (path === 'locale/locale') {
        continue;
      }
      code = path.replace('locale/', '');
      results.push(this[code] = require(path));
    }
    return results;
  },
  'en': {
    nativeDescription: 'English',
    englishDescription: 'English'
  },
  'en-US': {
    nativeDescription: 'English (US)',
    englishDescription: 'English (US)'
  },
  'en-GB': {
    nativeDescription: 'English (UK)',
    englishDescription: 'English (UK)'
  },
  'zh-HANS': {
    nativeDescription: '简体中文',
    englishDescription: 'Chinese (Simplified)'
  },
  'zh-HANT': {
    nativeDescription: '繁體中文',
    englishDescription: 'Chinese (Traditional)'
  },
  'ru': {
    nativeDescription: 'русский',
    englishDescription: 'Russian'
  },
  'es-ES': {
    nativeDescription: 'español (ES)',
    englishDescription: 'Spanish (Spain)'
  },
  'es-419': {
    nativeDescription: 'español (América Latina)',
    englishDescription: 'Spanish (Latin America)'
  },
  'fr': {
    nativeDescription: 'français',
    englishDescription: 'French'
  },
  'ar': {
    nativeDescription: 'العربية',
    englishDescription: 'Arabic'
  },
  'bg': {
    nativeDescription: 'български език',
    englishDescription: 'Bulgarian'
  },
  'ca': {
    nativeDescription: 'Català',
    englishDescription: 'Catalan'
  },
  'cs': {
    nativeDescription: 'čeština',
    englishDescription: 'Czech'
  },
  'da': {
    nativeDescription: 'dansk',
    englishDescription: 'Danish'
  },
  'de-DE': {
    nativeDescription: 'Deutsch (Deutschland)',
    englishDescription: 'German (Germany)'
  },
  'de-AT': {
    nativeDescription: 'Deutsch (Österreich)',
    englishDescription: 'German (Austria)'
  },
  'de-CH': {
    nativeDescription: 'Deutsch (Schweiz)',
    englishDescription: 'German (Switzerland)'
  },
  'et': {
    nativeDescription: 'Eesti',
    englishDescription: 'Estonian'
  },
  'el': {
    nativeDescription: 'Ελληνικά',
    englishDescription: 'Greek'
  },
  'eo': {
    nativeDescription: 'Esperanto',
    englishDescription: 'Esperanto'
  },
  'fa': {
    nativeDescription: 'فارسی',
    englishDescription: 'Persian'
  },
  'gl': {
    nativeDescription: 'Galego',
    englishDescription: 'Galician'
  },
  'ko': {
    nativeDescription: '한국어',
    englishDescription: 'Korean'
  },
  'haw': {
    nativeDescription: 'ʻŌlelo Hawaiʻi',
    englishDescription: 'Hawaiian'
  },
  'he': {
    nativeDescription: 'עברית',
    englishDescription: 'Hebrew'
  },
  'hr': {
    nativeDescription: 'hrvatski jezik',
    englishDescription: 'Croatian'
  },
  'hu': {
    nativeDescription: 'magyar',
    englishDescription: 'Hungarian'
  },
  'id': {
    nativeDescription: 'Bahasa Indonesia',
    englishDescription: 'Indonesian'
  },
  'it': {
    nativeDescription: 'Italiano',
    englishDescription: 'Italian'
  },
  'lt': {
    nativeDescription: 'lietuvių kalba',
    englishDescription: 'Lithuanian'
  },
  'mi': {
    nativeDescription: 'te reo Māori',
    englishDescription: 'Māori'
  },
  'mk-MK': {
    nativeDescription: 'Македонски',
    englishDescription: 'Macedonian'
  },
  'hi': {
    nativeDescription: 'मानक हिन्दी',
    englishDescription: 'Hindi'
  },
  'ms': {
    nativeDescription: 'Bahasa Melayu',
    englishDescription: 'Bahasa Malaysia'
  },
  'my': {
    nativeDescription: 'မြန်မာစကား',
    englishDescription: 'Myanmar language'
  },
  'nl': {
    nativeDescription: 'Nederlands',
    englishDescription: 'Dutch'
  },
  'nl-BE': {
    nativeDescription: 'Nederlands (België)',
    englishDescription: 'Dutch (Belgium)'
  },
  'nl-NL': {
    nativeDescription: 'Nederlands (Nederland)',
    englishDescription: 'Dutch (Netherlands)'
  },
  'ja': {
    nativeDescription: '日本語',
    englishDescription: 'Japanese'
  },
  'nb': {
    nativeDescription: 'Norsk Bokmål',
    englishDescription: 'Norwegian (Bokmål)'
  },
  'nn': {
    nativeDescription: 'Norsk Nynorsk',
    englishDescription: 'Norwegian (Nynorsk)'
  },
  'uz': {
    nativeDescription: "O'zbekcha",
    englishDescription: 'Uzbek'
  },
  'pl': {
    nativeDescription: 'język polski',
    englishDescription: 'Polish'
  },
  'pt-PT': {
    nativeDescription: 'Português (Portugal)',
    englishDescription: 'Portuguese (Portugal)'
  },
  'pt-BR': {
    nativeDescription: 'Português (Brasil)',
    englishDescription: 'Portuguese (Brazil)'
  },
  'ro': {
    nativeDescription: 'limba română',
    englishDescription: 'Romanian'
  },
  'sr': {
    nativeDescription: 'српски',
    englishDescription: 'Serbian'
  },
  'sk': {
    nativeDescription: 'slovenčina',
    englishDescription: 'Slovak'
  },
  'sl': {
    nativeDescription: 'slovenščina',
    englishDescription: 'Slovene'
  },
  'fi': {
    nativeDescription: 'suomi',
    englishDescription: 'Finnish'
  },
  'sv': {
    nativeDescription: 'Svenska',
    englishDescription: 'Swedish'
  },
  'th': {
    nativeDescription: 'ไทย',
    englishDescription: 'Thai'
  },
  'tr': {
    nativeDescription: 'Türkçe',
    englishDescription: 'Turkish'
  },
  'uk': {
    nativeDescription: 'українська мова',
    englishDescription: 'Ukrainian'
  },
  'ur': {
    nativeDescription: 'اُردُو',
    englishDescription: 'Urdu'
  },
  'vi': {
    nativeDescription: 'Tiếng Việt',
    englishDescription: 'Vietnamese'
  },
  'zh-WUU-HANS': {
    nativeDescription: '吴语',
    englishDescription: 'Wuu (Simplified)'
  },
  'zh-WUU-HANT': {
    nativeDescription: '吳語',
    englishDescription: 'Wuu (Traditional)'
  }
};
});

;require.register("locale/en", function(exports, require, module) {
module.exports = {
  nativeDescription: "English",
  englishDescription: "English",
  translation: {
    new_home: {
      slogan: "The most engaging game for learning programming.",
      classroom_edition: "Classroom Edition:",
      learn_to_code: "Learn to code:",
      teacher: "Teacher",
      student: "Student",
      play_now: "Play Now",
      im_a_teacher: "I'm a Teacher",
      im_a_student: "I'm a Student",
      learn_more: "Learn more",
      classroom_in_a_box: "A classroom in-a-box for teaching computer science.",
      codecombat_is: "CodeCombat is a platform <strong>for students</strong> to learn computer science while playing through a real game.",
      our_courses: "Our courses have been specifically playtested <strong>to excel in the classroom</strong>, even by teachers with little to no prior programming experience.",
      top_screenshots_hint: "Students write code and see their changes update in real-time",
      designed_with: "Designed with teachers in mind",
      real_code: "Real, typed code",
      from_the_first_level: "from the first level",
      getting_students: "Getting students to typed code as quickly as possible is critical to learning programming syntax and proper structure.",
      educator_resources: "Educator resources",
      course_guides: "and course guides",
      teaching_computer_science: "Teaching computer science does not require a costly degree, because we provide tools to support educators of all backgrounds.",
      accessible_to: "Accessible to",
      everyone: "everyone",
      democratizing: "Democratizing the process of learning coding is at the core of our philosophy. Everyone should be able to learn to code.",
      forgot_learning: "I think they actually forgot that they were actually learning something.",
      wanted_to_do: " Coding is something I've always wanted to do, and I never thought I would be able to learn it in school.",
      why_games: "Why is learning through games important?",
      games_reward: "Games reward the productive struggle.",
      encourage: "Gaming is a medium that encourages interaction, discovery, and trial-and-error. A good game challenges the player to master skills over time, which is the same critical process students go through as they learn.",
      excel: "Games excel at rewarding",
      struggle: "productive struggle",
      kind_of_struggle: "the kind of struggle that results in learning that’s engaging and",
      motivating: "motivating",
      not_tedious: "not tedious.",
      gaming_is_good: "Studies suggest gaming is good for children’s brains. (it’s true!)",
      game_based: "When game-based learning systems are",
      compared: "compared",
      conventional: "against conventional assessment methods, the difference is clear: games are better at helping students retain knowledge, concentrate and",
      perform_at_higher_level: "perform at a higher level of achievement",
      feedback: "Games also provide real-time feedback that allows students to adjust their solution path and understand concepts more holistically, instead of being limited to just “correct” or “incorrect” answers.",
      real_game: "A real game, played with real coding.",
      great_game: "A great game is more than just badges and achievements - it’s about a player’s journey, well-designed puzzles, and the ability to tackle challenges with agency and confidence.",
      agency: "CodeCombat is a game that gives players that agency and confidence with our robust typed code engine, which helps beginner and advanced students alike write proper, valid code.",
      request_demo_title: "Get your students started today!",
      request_demo_subtitle: "Request a demo and get your students started in less than an hour.",
      get_started_title: "Set up your class today",
      get_started_subtitle: "Set up a class, add your students, and monitor their progress as they learn computer science.",
      request_demo: "Request a Demo",
      setup_a_class: "Set Up a Class",
      have_an_account: "Have an account?",
      logged_in_as: "You are currently logged in as",
      computer_science: "Computer science courses for all ages",
      show_me_lesson_time: "Show me lesson time estimates for:",
      curriculum: "Total curriculum hours:",
      ffa: "Free for all students",
      lesson_time: "Lesson time:",
      coming_soon: "More coming soon!",
      courses_available_in: "Courses are available in JavaScript and Python. Web Development courses utilize HTML, CSS, jQuery, and Bootstrap.",
      boast: "Boasts riddles that are complex enough to fascinate gamers and coders alike.",
      winning: "A winning combination of RPG gameplay and programming homework that pulls off making kid-friendly education legitimately enjoyable.",
      run_class: "Everything you need to run a computer science class in your school today, no CS background required.",
      goto_classes: "Go to My Classes",
      view_profile: "View My Profile",
      view_progress: "View Progress",
      go_to_courses: "Go to My Courses",
      want_coco: "Want CodeCombat at your school?"
    },
    nav: {
      play: "Levels",
      community: "Community",
      courses: "Courses",
      blog: "Blog",
      forum: "Forum",
      account: "Account",
      my_account: "My Account",
      profile: "Profile",
      home: "Home",
      contribute: "Contribute",
      legal: "Legal",
      privacy: "Privacy",
      about: "About",
      contact: "Contact",
      twitter_follow: "Follow",
      teachers: "Teachers",
      students: "Students",
      careers: "Careers",
      facebook: "Facebook",
      twitter: "Twitter",
      create_a_class: "Create a Class",
      other: "Other",
      learn_to_code: "Learn to Code!",
      toggle_nav: "Toggle navigation",
      jobs: "Jobs",
      schools: "Schools",
      get_involved: "Get Involved",
      open_source: "Open source (GitHub)",
      support: "Support",
      faqs: "FAQs",
      help_pref: "Need help? Email",
      help_suff: "and we'll get in touch!",
      resource_hub: "Resource Hub"
    },
    modal: {
      close: "Close",
      okay: "Okay"
    },
    not_found: {
      page_not_found: "Page not found"
    },
    diplomat_suggestion: {
      title: "Help translate CodeCombat!",
      sub_heading: "We need your language skills.",
      pitch_body: "We develop CodeCombat in English, but we already have players all over the world. Many of them want to play in {English} but don't speak English, so if you can speak both, please consider signing up to be a Diplomat and help translate both the CodeCombat website and all the levels into {English}.",
      missing_translations: "Until we can translate everything into {English}, you'll see English when {English} isn't available.",
      learn_more: "Learn more about being a Diplomat",
      subscribe_as_diplomat: "Subscribe as a Diplomat"
    },
    play: {
      play_as: "Play As",
      compete: "Compete!",
      spectate: "Spectate",
      players: "players",
      hours_played: "hours played",
      items: "Items",
      unlock: "Unlock",
      confirm: "Confirm",
      owned: "Owned",
      locked: "Locked",
      purchasable: "Purchasable",
      available: "Available",
      skills_granted: "Skills Granted",
      heroes: "Heroes",
      achievements: "Achievements",
      settings: "Settings",
      poll: "Poll",
      next: "Next",
      change_hero: "Change Hero",
      buy_gems: "Buy Gems",
      subscription_required: "Subscription Required",
      anonymous: "Anonymous Player",
      level_difficulty: "Difficulty: ",
      play_classroom_version: "Play Classroom Version",
      campaign_beginner: "Beginner Campaign",
      awaiting_levels_adventurer_prefix: "We release new levels every week.",
      awaiting_levels_adventurer: "Sign up as an Adventurer",
      awaiting_levels_adventurer_suffix: "to be the first to play new levels.",
      adjust_volume: "Adjust volume",
      campaign_multiplayer: "Multiplayer Arenas",
      campaign_multiplayer_description: "... in which you code head-to-head against other players."
    },
    code: {
      "if": "if",
      "else": "else",
      elif: "else if",
      "while": "while",
      loop: "loop",
      "for": "for",
      "break": "break",
      "continue": "continue",
      pass: "pass",
      "return": "return",
      then: "then",
      "do": "do",
      end: "end",
      "function": "function",
      def: "define",
      "var": "variable",
      self: "self",
      hero: "hero",
      "this": "this",
      or: "or",
      "||": "or",
      and: "and",
      "&&": "and",
      not: "not",
      "!": "not",
      "=": "assign",
      "==": "equals",
      "===": "strictly equals",
      "!=": "does not equal",
      "!==": "does not strictly equal",
      ">": "is greater than",
      ">=": "is greater than or equal",
      "<": "is less than",
      "<=": "is less than or equal",
      "*": "multiplied by",
      "/": "divided by",
      "+": "plus",
      "-": "minus",
      "+=": "add and assign",
      "-=": "subtract and assign",
      True: "True",
      "true": "true",
      False: "False",
      "false": "false",
      undefined: "undefined",
      "null": "null",
      nil: "nil",
      None: "None"
    },
    share_progress_modal: {
      blurb: "You’re making great progress! Tell your parent how much you've learned with CodeCombat.",
      email_invalid: "Email address invalid.",
      form_blurb: "Enter your parent's email below and we’ll show them!",
      form_label: "Email Address",
      placeholder: "email address",
      title: "Excellent Work, Apprentice"
    },
    login: {
      sign_up: "Create Account",
      email_or_username: "Email or username",
      log_in: "Log In",
      logging_in: "Logging In",
      log_out: "Log Out",
      forgot_password: "Forgot your password?",
      authenticate_gplus: "Authenticate G+",
      load_profile: "Load G+ Profile",
      finishing: "Finishing",
      sign_in_with_facebook: "Sign in with Facebook",
      sign_in_with_gplus: "Sign in with G+",
      signup_switch: "Want to create an account?"
    },
    signup: {
      create_student_header: "Create Student Account",
      create_teacher_header: "Create Teacher Account",
      create_individual_header: "Create Individual Account",
      email_announcements: "Receive announcements about new CodeCombat levels and features!",
      creating: "Creating Account...",
      sign_up: "Sign Up",
      log_in: "log in with password",
      required: "You need to log in before you can go that way.",
      login_switch: "Already have an account?",
      school_name: "School Name and City",
      optional: "optional",
      school_name_placeholder: "Example High School, Springfield, IL",
      connect_with: "Connect with:",
      connected_gplus_header: "You've successfully connected with Google+!",
      connected_gplus_p: "Finish signing up so you can log in with your Google+ account.",
      gplus_exists: "You already have an account associated with Google+!",
      connected_facebook_header: "You've successfully connected with Facebook!",
      connected_facebook_p: "Finish signing up so you can log in with your Facebook account.",
      facebook_exists: "You already have an account associated with Facebook!",
      hey_students: "Students, enter the class code from your teacher.",
      birthday: "Birthday",
      parent_email_blurb: "We know you can't wait to learn programming &mdash; we're excited too! Your parents will receive an email with further instructions on how to create an account for you. Email {{email_link}} if you have any questions.",
      classroom_not_found: "No classes exist with this Class Code. Check your spelling or ask your teacher for help.",
      checking: "Checking...",
      account_exists: "This email is already in use:",
      sign_in: "Sign in",
      email_good: "Email looks good!",
      name_taken: "Username already taken! Try {{suggestedName}}?",
      name_available: "Username available!",
      name_is_email: "Username may not be an email",
      choose_type: "Choose your account type:",
      teacher_type_1: "Teach programming using CodeCombat!",
      teacher_type_2: "Set up your class",
      teacher_type_3: "Access Course Guides",
      teacher_type_4: "View student progress",
      signup_as_teacher: "Sign up as a Teacher",
      student_type_1: "Learn to program while playing an engaging game!",
      student_type_2: "Play with your class",
      student_type_3: "Compete in arenas",
      student_type_4: "Choose your hero!",
      student_type_5: "Have your Class Code ready!",
      signup_as_student: "Sign up as a Student",
      individuals_or_parents: "Individuals & Parents",
      individual_type: "For players learning to code outside of a class. Parents should sign up for an account here.",
      signup_as_individual: "Sign up as an Individual",
      enter_class_code: "Enter your Class Code",
      enter_birthdate: "Enter your birthdate:",
      parent_use_birthdate: "Parents, use your own birthdate.",
      ask_teacher_1: "Ask your teacher for your Class Code.",
      ask_teacher_2: "Not part of a class? Create an ",
      ask_teacher_3: "Individual Account",
      ask_teacher_4: " instead.",
      about_to_join: "You're about to join:",
      enter_parent_email: "Enter your parent’s email address:",
      parent_email_error: "Something went wrong when trying to send the email. Check the email address and try again.",
      parent_email_sent: "We’ve sent an email with further instructions on how to create an account. Ask your parent to check their inbox.",
      account_created: "Account Created!",
      confirm_student_blurb: "Write down your information so that you don't forget it. Your teacher can also help you reset your password at any time.",
      confirm_individual_blurb: "Write down your login information in case you need it later. Verify your email so you can recover your account if you ever forget your password - check your inbox!",
      write_this_down: "Write this down:",
      start_playing: "Start Playing!",
      sso_connected: "Successfully connected with:",
      select_your_starting_hero: "Select Your Starting Hero:",
      you_can_always_change_your_hero_later: "You can always change your hero later."
    },
    recover: {
      recover_account_title: "Recover Account",
      send_password: "Send Recovery Password",
      recovery_sent: "Recovery email sent."
    },
    items: {
      primary: "Primary",
      secondary: "Secondary",
      armor: "Armor",
      accessories: "Accessories",
      misc: "Misc",
      books: "Books"
    },
    common: {
      back: "Back",
      coming_soon: "Coming soon!",
      "continue": "Continue",
      default_code: "Default Code",
      loading: "Loading...",
      overview: "Overview",
      solution: "Solution",
      intro: "Intro",
      saving: "Saving...",
      sending: "Sending...",
      send: "Send",
      sent: "Sent",
      cancel: "Cancel",
      save: "Save",
      publish: "Publish",
      create: "Create",
      fork: "Fork",
      play: "Play",
      retry: "Retry",
      actions: "Actions",
      info: "Info",
      help: "Help",
      watch: "Watch",
      unwatch: "Unwatch",
      submit_patch: "Submit Patch",
      submit_changes: "Submit Changes",
      save_changes: "Save Changes",
      required_field: "required"
    },
    general: {
      and: "and",
      name: "Name",
      date: "Date",
      body: "Body",
      version: "Version",
      pending: "Pending",
      accepted: "Accepted",
      rejected: "Rejected",
      withdrawn: "Withdrawn",
      accept: "Accept",
      reject: "Reject",
      withdraw: "Withdraw",
      submitter: "Submitter",
      submitted: "Submitted",
      commit_msg: "Commit Message",
      version_history: "Version History",
      version_history_for: "Version History for: ",
      select_changes: "Select two changes below to see the difference.",
      undo_prefix: "Undo",
      undo_shortcut: "(Ctrl+Z)",
      redo_prefix: "Redo",
      redo_shortcut: "(Ctrl+Shift+Z)",
      play_preview: "Play preview of current level",
      result: "Result",
      results: "Results",
      description: "Description",
      or: "or",
      subject: "Subject",
      email: "Email",
      password: "Password",
      confirm_password: "Confirm Password",
      message: "Message",
      code: "Code",
      ladder: "Ladder",
      when: "When",
      opponent: "Opponent",
      rank: "Rank",
      score: "Score",
      win: "Win",
      loss: "Loss",
      tie: "Tie",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      player: "Player",
      player_level: "Level",
      warrior: "Warrior",
      ranger: "Ranger",
      wizard: "Wizard",
      first_name: "First Name",
      last_name: "Last Name",
      last_initial: "Last Initial",
      username: "Username"
    },
    units: {
      second: "second",
      seconds: "seconds",
      minute: "minute",
      minutes: "minutes",
      hour: "hour",
      hours: "hours",
      day: "day",
      days: "days",
      week: "week",
      weeks: "weeks",
      month: "month",
      months: "months",
      year: "year",
      years: "years"
    },
    play_level: {
      level_complete: "Level Complete",
      completed_level: "Completed Level:",
      course: "Course:",
      done: "Done",
      next_level: "Next Level",
      next_game: "Next game",
      language: "Language",
      languages: "Languages",
      programming_language: "Programming language",
      show_menu: "Show game menu",
      home: "Home",
      level: "Level",
      skip: "Skip",
      game_menu: "Game Menu",
      guide: "Guide",
      restart: "Restart",
      goals: "Goals",
      goal: "Goal",
      running: "Running...",
      success: "Success!",
      incomplete: "Incomplete",
      timed_out: "Ran out of time",
      failing: "Failing",
      reload: "Reload",
      reload_title: "Reload All Code?",
      reload_really: "Are you sure you want to reload this level back to the beginning?",
      reload_confirm: "Reload All",
      victory: "Victory",
      victory_title_prefix: "",
      victory_title_suffix: " Complete",
      victory_sign_up: "Sign Up to Save Progress",
      victory_sign_up_poke: "Want to save your code? Create a free account!",
      victory_rate_the_level: "How fun was this level?",
      victory_return_to_ladder: "Return to Ladder",
      victory_saving_progress: "Saving Progress",
      victory_go_home: "Go Home",
      victory_review: "Tell us more!",
      victory_review_placeholder: "How was the level?",
      victory_hour_of_code_done: "Are You Done?",
      victory_hour_of_code_done_yes: "Yes, I'm finished with my Hour of Code™!",
      victory_experience_gained: "XP Gained",
      victory_gems_gained: "Gems Gained",
      victory_new_item: "New Item",
      victory_new_hero: "New Hero",
      victory_viking_code_school: "Holy smokes, that was a hard level you just beat! If you aren't already a software developer, you should be. You just got fast-tracked for acceptance with Viking Code School, where you can take your skills to the next level and become a professional web developer in 14 weeks.",
      victory_become_a_viking: "Become a Viking",
      victory_no_progress_for_teachers: "Progress is not saved for teachers. But, you can add a student account to your classroom for yourself.",
      guide_title: "Guide",
      tome_cast_button_run: "Run",
      tome_cast_button_running: "Running",
      tome_cast_button_ran: "Ran",
      tome_submit_button: "Submit",
      tome_reload_method: "Reload original code to restart the level",
      tome_available_spells: "Available Spells",
      tome_your_skills: "Your Skills",
      tome_current_method: "Current Method",
      hints: "Hints",
      hints_title: "Hint {{number}}",
      code_saved: "Code Saved",
      skip_tutorial: "Skip (esc)",
      keyboard_shortcuts: "Key Shortcuts",
      loading_ready: "Ready!",
      loading_start: "Start Level",
      problem_alert_title: "Fix Your Code",
      time_current: "Now:",
      time_total: "Max:",
      time_goto: "Go to:",
      non_user_code_problem_title: "Unable to Load Level",
      infinite_loop_title: "Infinite Loop Detected",
      infinite_loop_description: "The initial code to build the world never finished running. It's probably either really slow or has an infinite loop. Or there might be a bug. You can either try running this code again or reset the code to the default state. If that doesn't fix it, please let us know.",
      check_dev_console: "You can also open the developer console to see what might be going wrong.",
      check_dev_console_link: "(instructions)",
      infinite_loop_try_again: "Try Again",
      infinite_loop_reset_level: "Reset Level",
      infinite_loop_comment_out: "Comment Out My Code",
      tip_toggle_play: "Toggle play/paused with Ctrl+P.",
      tip_scrub_shortcut: "Use Ctrl+[ and Ctrl+] to rewind and fast-forward.",
      tip_guide_exists: "Click the guide, inside game menu (at the top of the page), for useful info.",
      tip_open_source: "CodeCombat is 100% open source!",
      tip_tell_friends: "Enjoying CodeCombat? Tell your friends about us!",
      tip_beta_launch: "CodeCombat launched its beta in October, 2013.",
      tip_think_solution: "Think of the solution, not the problem.",
      tip_theory_practice: "In theory, there is no difference between theory and practice. But in practice, there is. - Yogi Berra",
      tip_error_free: "There are two ways to write error-free programs; only the third one works. - Alan Perlis",
      tip_debugging_program: "If debugging is the process of removing bugs, then programming must be the process of putting them in. - Edsger W. Dijkstra",
      tip_forums: "Head over to the forums and tell us what you think!",
      tip_baby_coders: "In the future, even babies will be Archmages.",
      tip_morale_improves: "Loading will continue until morale improves.",
      tip_all_species: "We believe in equal opportunities to learn programming for all species.",
      tip_reticulating: "Reticulating spines.",
      tip_harry: "Yer a Wizard, ",
      tip_great_responsibility: "With great coding skill comes great debug responsibility.",
      tip_munchkin: "If you don't eat your vegetables, a munchkin will come after you while you're asleep.",
      tip_binary: "There are only 10 types of people in the world: those who understand binary, and those who don't.",
      tip_commitment_yoda: "A programmer must have the deepest commitment, the most serious mind. ~ Yoda",
      tip_no_try: "Do. Or do not. There is no try. - Yoda",
      tip_patience: "Patience you must have, young Padawan. - Yoda",
      tip_documented_bug: "A documented bug is not a bug; it is a feature.",
      tip_impossible: "It always seems impossible until it's done. - Nelson Mandela",
      tip_talk_is_cheap: "Talk is cheap. Show me the code. - Linus Torvalds",
      tip_first_language: "The most disastrous thing that you can ever learn is your first programming language. - Alan Kay",
      tip_hardware_problem: "Q: How many programmers does it take to change a light bulb?  A: None, it's a hardware problem.",
      tip_hofstadters_law: "Hofstadter's Law: It always takes longer than you expect, even when you take into account Hofstadter's Law.",
      tip_premature_optimization: "Premature optimization is the root of all evil. - Donald Knuth",
      tip_brute_force: "When in doubt, use brute force. - Ken Thompson",
      tip_extrapolation: "There are only two kinds of people: those that can extrapolate from incomplete data...",
      tip_superpower: "Coding is the closest thing we have to a superpower.",
      tip_control_destiny: "In real open source, you have the right to control your own destiny. - Linus Torvalds",
      tip_no_code: "No code is faster than no code.",
      tip_code_never_lies: "Code never lies, comments sometimes do. — Ron Jeffries",
      tip_reusable_software: "Before software can be reusable it first has to be usable.",
      tip_optimization_operator: "Every language has an optimization operator. In most languages that operator is ‘//’",
      tip_lines_of_code: "Measuring programming progress by lines of code is like measuring aircraft building progress by weight. — Bill Gates",
      tip_source_code: "I want to change the world but they would not give me the source code.",
      tip_javascript_java: "Java is to JavaScript what Car is to Carpet. - Chris Heilmann",
      tip_move_forward: "Whatever you do, keep moving forward. - Martin Luther King Jr.",
      tip_google: "Have a problem you can't solve? Google it!",
      tip_adding_evil: "Adding a pinch of evil.",
      tip_hate_computers: "That's the thing about people who think they hate computers. What they really hate is lousy programmers. - Larry Niven",
      tip_open_source_contribute: "You can help CodeCombat improve!",
      tip_recurse: "To iterate is human, to recurse divine. - L. Peter Deutsch",
      tip_free_your_mind: "You have to let it all go, Neo. Fear, doubt, and disbelief. Free your mind. - Morpheus",
      tip_strong_opponents: "Even the strongest of opponents always has a weakness. - Itachi Uchiha",
      tip_paper_and_pen: "Before you start coding, you can always plan with a sheet of paper and a pen.",
      tip_solve_then_write: "First, solve the problem. Then, write the code. - John Johnson",
      tip_compiler_ignores_comments: "Sometimes I think that the compiler ignores my comments.",
      tip_understand_recursion: "The only way to understand recursion is to understand recursion.",
      tip_life_and_polymorphism: "Open Source is like a totally polymorphic heterogeneous structure: All types are welcome.",
      tip_mistakes_proof_of_trying: "Mistakes in your code are just proof that you are trying.",
      tip_adding_orgres: "Rounding up ogres.",
      tip_sharpening_swords: "Sharpening the swords.",
      tip_ratatouille: "You must not let anyone define your limits because of where you come from. Your only limit is your soul. - Gusteau, Ratatouille",
      tip_nemo: "When life gets you down, want to know what you've gotta do? Just keep swimming, just keep swimming. - Dory, Finding Nemo",
      tip_internet_weather: "Just move to the internet, it's great here. We get to live inside where the weather is always awesome. - John Green",
      tip_nerds: "Nerds are allowed to love stuff, like jump-up-and-down-in-the-chair-can't-control-yourself love it. - John Green",
      tip_self_taught: "I taught myself 90% of what I've learned. And that's normal! - Hank Green",
      tip_luna_lovegood: "Don't worry, you're just as sane as I am. - Luna Lovegood",
      tip_good_idea: "The best way to have a good idea is to have a lot of ideas. - Linus Pauling",
      tip_programming_not_about_computers: "Computer Science is no more about computers than astronomy is about telescopes. - Edsger Dijkstra",
      tip_mulan: "Believe you can, then you will. - Mulan"
    },
    play_game_dev_level: {
      created_by: "Created by {{name}}",
      how_to_play_title: "How to play:",
      how_to_play_1: "Use the mouse to control the hero!",
      how_to_play_2: "Click anywhere on the map to move to that location.",
      how_to_play_3: "Click on the ogres to attack them.",
      restart: "Restart Level",
      play: "Play Level",
      play_more_codecombat: "Play More CodeCombat",
      default_student_instructions: "Click to control your hero and win your game!",
      back_to_coding: "Back to Coding"
    },
    game_menu: {
      inventory_tab: "Inventory",
      save_load_tab: "Save/Load",
      options_tab: "Options",
      guide_tab: "Guide",
      guide_video_tutorial: "Video Tutorial",
      guide_tips: "Tips",
      multiplayer_tab: "Multiplayer",
      auth_tab: "Sign Up",
      inventory_caption: "Equip your hero",
      choose_hero_caption: "Choose hero, language",
      save_load_caption: "... and view history",
      options_caption: "Configure settings",
      guide_caption: "Docs and tips",
      multiplayer_caption: "Play with friends!",
      auth_caption: "Save your progress."
    },
    leaderboard: {
      view_other_solutions: "View Leaderboards",
      scores: "Scores",
      top_players: "Top Players by",
      day: "Today",
      week: "This Week",
      all: "All-Time",
      time: "Time",
      damage_taken: "Damage Taken",
      damage_dealt: "Damage Dealt",
      difficulty: "Difficulty",
      gold_collected: "Gold Collected"
    },
    inventory: {
      equipped_item: "Equipped",
      required_purchase_title: "Required",
      available_item: "Available",
      restricted_title: "Restricted",
      should_equip: "(double-click to equip)",
      equipped: "(equipped)",
      locked: "(locked)",
      restricted: "(restricted in this level)",
      equip: "Equip",
      unequip: "Unequip"
    },
    buy_gems: {
      few_gems: "A few gems",
      pile_gems: "Pile of gems",
      chest_gems: "Chest of gems",
      purchasing: "Purchasing...",
      declined: "Your card was declined",
      retrying: "Server error, retrying.",
      prompt_title: "Not Enough Gems",
      prompt_body: "Do you want to get more?",
      prompt_button: "Enter Shop",
      recovered: "Previous gems purchase recovered. Please refresh the page.",
      price: "x{{gems}} / mo"
    },
    subscribe: {
      comparison_blurb: "Sharpen your skills with a CodeCombat subscription!",
      feature1: "__levelsCount__+ basic levels across __worldsCount__ worlds",
      feature2: "__heroesCount__ powerful <strong>new heroes</strong> with unique skills!",
      feature3: "__bonusLevelsCount__+ bonus levels",
      feature4: "<strong>{{gems}} bonus gems</strong> every month!",
      feature6: "Premium email support",
      feature7: "Private <strong>Clans</strong>",
      feature8: "<strong>No ads!</strong>",
      free: "Free",
      month: "month",
      must_be_logged: "You must be logged in first. Please create an account or log in from the menu above.",
      subscribe_title: "Subscribe",
      unsubscribe: "Unsubscribe",
      confirm_unsubscribe: "Confirm Unsubscribe",
      never_mind: "Never Mind, I Still Love You",
      thank_you_months_prefix: "Thank you for supporting us these last",
      thank_you_months_suffix: "months.",
      thank_you: "Thank you for supporting CodeCombat.",
      sorry_to_see_you_go: "Sorry to see you go! Please let us know what we could have done better.",
      unsubscribe_feedback_placeholder: "O, what have we done?",
      parent_button: "Ask your parent",
      parent_email_description: "We'll email them so they can buy you a CodeCombat subscription.",
      parent_email_input_invalid: "Email address invalid.",
      parent_email_input_label: "Parent email address",
      parent_email_input_placeholder: "Enter parent email",
      parent_email_send: "Send Email",
      parent_email_sent: "Email sent!",
      parent_email_title: "What's your parent's email?",
      parents: "For Parents",
      parents_title: "Dear Parent: Your child is learning to code. Will you help them continue?",
      parents_blurb1: "Your child has played __nLevels__ levels and learned programming basics. Help cultivate their interest and buy them a subscription so they can keep playing.",
      parents_blurb1a: "Computer programming is an essential skill that your child will undoubtedly use as an adult. By 2020, basic software skills will be needed by 77% of jobs, and software engineers are in high demand across the world. Did you know that Computer Science is the highest-paid university degree?",
      parents_blurb2: "For ${{price}} USD/mo, your child will get new challenges every week and personal email support from professional programmers.",
      parents_blurb3: "No Risk: 100% money back guarantee, easy 1-click unsubscribe.",
      payment_methods: "Payment Methods",
      payment_methods_title: "Accepted Payment Methods",
      payment_methods_blurb1: "We currently accept credit cards and Alipay. You can also PayPal {{three_month_price}} USD to nick@codecombat.com with your account email in the memo to purchase three months' subscription and gems, or ${{year_price}} for a year.",
      payment_methods_blurb2: "If you require an alternate form of payment, please contact",
      sale_button: "Sale!",
      sale_button_title: "Save $21 when you purchase a 1 year subscription",
      stripe_description: "Monthly Subscription",
      stripe_description_year_sale: "1 Year Subscription (${{discount}} discount)",
      subscription_required_to_play: "You'll need a subscription to play this level.",
      unlock_help_videos: "Subscribe to unlock all video tutorials.",
      personal_sub: "Personal Subscription",
      loading_info: "Loading subscription information...",
      managed_by: "Managed by",
      will_be_cancelled: "Will be cancelled on",
      currently_free: "You currently have a free subscription",
      currently_free_until: "You currently have a subscription until",
      was_free_until: "You had a free subscription until",
      managed_subs: "Managed Subscriptions",
      subscribing: "Subscribing...",
      current_recipients: "Current Recipients",
      unsubscribing: "Unsubscribing",
      subscribe_prepaid: "Click Subscribe to use prepaid code",
      using_prepaid: "Using prepaid code for monthly subscription"
    },
    choose_hero: {
      choose_hero: "Choose Your Hero",
      programming_language: "Programming Language",
      programming_language_description: "Which programming language do you want to use?",
      "default": "Default",
      experimental: "Experimental",
      python_blurb: "Simple yet powerful, great for beginners and experts.",
      javascript_blurb: "The language of the web. (Not the same as Java.)",
      coffeescript_blurb: "Nicer JavaScript syntax.",
      lua_blurb: "Game scripting language.",
      java_blurb: "(Subscriber Only) Android and enterprise.",
      status: "Status",
      weapons: "Weapons",
      weapons_warrior: "Swords - Short Range, No Magic",
      weapons_ranger: "Crossbows, Guns - Long Range, No Magic",
      weapons_wizard: "Wands, Staffs - Long Range, Magic",
      attack: "Damage",
      health: "Health",
      speed: "Speed",
      regeneration: "Regeneration",
      range: "Range",
      blocks: "Blocks",
      backstab: "Backstab",
      skills: "Skills",
      attack_1: "Deals",
      attack_2: "of listed",
      attack_3: "weapon damage.",
      health_1: "Gains",
      health_2: "of listed",
      health_3: "armor health.",
      speed_1: "Moves at",
      speed_2: "meters per second.",
      available_for_purchase: "Available for Purchase",
      level_to_unlock: "Level to unlock:",
      restricted_to_certain_heroes: "Only certain heroes can play this level."
    },
    skill_docs: {
      "function": "function",
      method: "method",
      snippet: "snippet",
      number: "number",
      array: "array",
      object: "object",
      string: "string",
      writable: "writable",
      read_only: "read-only",
      action: "Action",
      spell: "Spell",
      action_name: "name",
      action_cooldown: "Takes",
      action_specific_cooldown: "Cooldown",
      action_damage: "Damage",
      action_range: "Range",
      action_radius: "Radius",
      action_duration: "Duration",
      example: "Example",
      ex: "ex",
      current_value: "Current Value",
      default_value: "Default value",
      parameters: "Parameters",
      required_parameters: "Required Parameters",
      optional_parameters: "Optional Parameters",
      returns: "Returns",
      granted_by: "Granted by"
    },
    save_load: {
      granularity_saved_games: "Saved",
      granularity_change_history: "History"
    },
    options: {
      general_options: "General Options",
      volume_label: "Volume",
      music_label: "Music",
      music_description: "Turn background music on/off.",
      editor_config_title: "Editor Configuration",
      editor_config_livecompletion_label: "Live Autocompletion",
      editor_config_livecompletion_description: "Displays autocomplete suggestions while typing.",
      editor_config_invisibles_label: "Show Invisibles",
      editor_config_invisibles_description: "Displays invisibles such as spaces or tabs.",
      editor_config_indentguides_label: "Show Indent Guides",
      editor_config_indentguides_description: "Displays vertical lines to see indentation better.",
      editor_config_behaviors_label: "Smart Behaviors",
      editor_config_behaviors_description: "Autocompletes brackets, braces, and quotes."
    },
    about: {
      main_title: "If you want to learn to program, you need to write (a lot of) code.",
      main_description: "At CodeCombat, our job is to make sure you're doing that with a smile on your face.",
      mission_link: "Mission",
      team_link: "Team",
      story_link: "Story",
      press_link: "Press",
      mission_title: "Our mission: make programming accessible to every student on Earth.",
      mission_description_1: "<strong>Programming is magic</strong>. It's the ability to create things from pure imagination. We started CodeCombat to give learners the feeling of wizardly power at their fingertips by using <strong>typed code</strong>.",
      mission_description_2: "As it turns out, that enables them to learn faster too. WAY faster. It's like having a conversation instead of reading a manual. We want to bring that conversation to every school and to <strong>every student</strong>, because everyone should have the chance to learn the magic of programming.",
      team_title: "Meet the CodeCombat team",
      team_values: "We value open and respectful dialog, where the best idea wins. Our decisions are grounded in customer research and our process is focused on delivering tangible results for them. Everyone is hands-on, from our CEO to our GitHub contributors, because we value growth and learning in our team.",
      nick_title: "Cofounder, CEO",
      nick_blurb: "Motivation Guru",
      matt_title: "Cofounder, CTO",
      cat_title: "Game Designer",
      cat_blurb: "Airbender",
      scott_title: "Cofounder, Software Engineer",
      scott_blurb: "Reasonable One",
      maka_title: "Customer Advocate",
      maka_blurb: "Storyteller",
      rob_title: "Software Engineer",
      rob_blurb: "Codes things and stuff",
      josh_c_title: "Game Designer",
      josh_c_blurb: "Designs games",
      robin_title: "UX Design & Research",
      robin_blurb: "Scaffolding",
      josh_title: "Game Designer",
      josh_blurb: "Floor Is Lava",
      phoenix_title: "Software Engineer",
      nolan_title: "Territory Manager",
      elliot_title: "Partnership Manager",
      elliot_blurb: "Mindreader",
      lisa_title: "School Specialist",
      lisa_blurb: "A gritty one",
      sean_title: "Territory Manager",
      retrostyle_title: "Illustration",
      retrostyle_blurb: "RetroStyle Games",
      jose_title: "Music",
      jose_blurb: "Taking Off",
      community_title: "...and our open-source community",
      community_subtitle: "Over 500 contributors have helped build CodeCombat, with more joining every week!",
      community_description_3: "CodeCombat is a",
      community_description_link_2: "community project",
      community_description_1: "with hundreds of players volunteering to create levels, contribute to our code to add features, fix bugs, playtest, and even translate the game into 50 languages so far. Employees, contributors and the site gain by sharing ideas and pooling effort, as does the open source community in general. The site is built on numerous open source projects, and we are open sourced to give back to the community and provide code-curious players a familiar project to explore and experiment with. Anyone can join the CodeCombat community! Check out our",
      community_description_link: "contribute page",
      community_description_2: "for more info.",
      number_contributors: "Over 450 contributors have lent their support and time to this project.",
      story_title: "Our story so far",
      story_subtitle: "Since 2013, CodeCombat has grown from a mere set of sketches to a living, thriving game.",
      story_statistic_1a: "5,000,000+",
      story_statistic_1b: "total players",
      story_statistic_1c: "have started their programming journey through CodeCombat",
      story_statistic_2a: "We’ve been translated into over 50 languages — our players hail from",
      story_statistic_2b: "200+ countries",
      story_statistic_3a: "Together, they have written",
      story_statistic_3b: "1 billion lines of code and counting",
      story_statistic_3c: "across many different programming languages",
      story_long_way_1: "Though we've come a long way...",
      story_sketch_caption: "Nick's very first sketch depicting a programming game in action.",
      story_long_way_2: "we still have much to do before we complete our quest, so...",
      jobs_title: "Come work with us and help write CodeCombat history!",
      jobs_subtitle: "Don't see a good fit but interested in keeping in touch? See our \"Create Your Own\" listing.",
      jobs_benefits: "Employee Benefits",
      jobs_benefit_4: "Unlimited vacation",
      jobs_benefit_5: "Professional development and continuing education support – free books and games!",
      jobs_benefit_6: "Medical (gold), dental, vision, commuter",
      jobs_benefit_7: "Sit-stand desks for all",
      jobs_benefit_9: "10-year option exercise window",
      jobs_benefit_10: "Maternity leave: 10 weeks paid, next 6 @ 55% salary",
      jobs_benefit_11: "Paternity leave: 10 weeks paid",
      learn_more: "Learn More",
      jobs_custom_title: "Create Your Own",
      jobs_custom_description: "Are you passionate about CodeCombat but don't see a job listed that matches your qualifications? Write us and show how you think you can contribute to our team. We'd love to hear from you!",
      jobs_custom_contact_1: "Send us a note at",
      jobs_custom_contact_2: "introducing yourself and we might get in touch in the future!",
      contact_title: "Press & Contact",
      contact_subtitle: "Need more information? Get in touch with us at",
      screenshots_title: "Game Screenshots",
      screenshots_hint: "(click to view full size)",
      downloads_title: "Download Assets & Information",
      about_codecombat: "About CodeCombat",
      logo: "Logo",
      screenshots: "Screenshots",
      character_art: "Character Art",
      download_all: "Download All",
      previous: "Previous",
      location_title: "We're located in downtown SF:"
    },
    teachers: {
      who_for_title: "Who is CodeCombat for?",
      who_for_1: "We recommend CodeCombat for students aged 9 and up. No prior programming experience is needed. We've designed CodeCombat to appeal to both boys and girls.",
      who_for_2: "Our Courses system allows teachers to set up classrooms, track progress and assign additional content to students through a dedicated interface.",
      more_info_title: "Where can I find more information?",
      more_info_1: "Our",
      more_info_2: "teachers forum",
      more_info_3: "is a good place to connect with fellow educators who are using CodeCombat.",
      licenses_needed: "Licenses needed"
    },
    teachers_quote: {
      name: "Demo Form",
      subtitle: "Get your students started in less than an hour. You'll be able to <strong>create a class, add students, and monitor their progress</strong> as they learn computer science.",
      email_exists: "User exists with this email.",
      phone_number: "Phone number",
      phone_number_help: "Where can we reach you during the workday?",
      primary_role_label: "Your Primary Role",
      role_default: "Select Role",
      primary_role_default: "Select Primary Role",
      purchaser_role_default: "Select Purchaser Role",
      tech_coordinator: "Technology coordinator",
      advisor: "Advisor",
      principal: "Principal",
      superintendent: "Superintendent",
      parent: "Parent",
      purchaser_role_label: "Your Purchaser Role",
      influence_advocate: "Influence/Advocate",
      evaluate_recommend: "Evaluate/Recommend",
      approve_funds: "Approve Funds",
      no_purchaser_role: "No role in purchase decisions",
      district_label: "District",
      district_na: "Enter N/A if not applicable",
      organization_label: "School",
      city: "City",
      state: "State",
      country: "Country",
      num_students_help: "How many do you anticipate enrolling in CodeCombat?",
      num_students_default: "Select Range",
      education_level_label: "Education Level of Students",
      education_level_help: "Choose as many as apply.",
      elementary_school: "Elementary School",
      high_school: "High School",
      please_explain: "(please explain)",
      middle_school: "Middle School",
      college_plus: "College or higher",
      anything_else: "Anything else we should know?",
      thanks_header: "Request Received!",
      thanks_sub_header: "Thanks for expressing interest in CodeCombat for your school.",
      thanks_p: "We'll be in touch soon! If you need to get in contact, you can reach us at:",
      back_to_classes: "Back to Classes",
      finish_signup: "Finish creating your teacher account:",
      finish_signup_p: "Create an account to set up a class, add your students, and monitor their progress as they learn computer science.",
      signup_with: "Sign up with:",
      connect_with: "Connect with:",
      conversion_warning: "WARNING: Your current account is a <em>Student Account</em>. Once you submit this form, your account will be updated to a Teacher Account.",
      learn_more_modal: "Teacher accounts on CodeCombat have the ability to monitor student progress, assign licenses and manage classrooms. Teacher accounts cannot be a part of a classroom - if you are currently enrolled in a class using this account, you will no longer be able to access it once you update to a Teacher Account.",
      create_account: "Create a Teacher Account",
      create_account_subtitle: "Get access to teacher-only tools for using CodeCombat in the classroom.  <strong>Set up a class</strong>, add your students, and <strong>monitor their progress</strong>!",
      convert_account_title: "Update to Teacher Account",
      not: "Not"
    },
    versions: {
      save_version_title: "Save New Version",
      new_major_version: "New Major Version",
      submitting_patch: "Submitting Patch...",
      cla_prefix: "To save changes, first you must agree to our",
      cla_url: "CLA",
      cla_suffix: ".",
      cla_agree: "I AGREE",
      owner_approve: "An owner will need to approve it before your changes will become visible."
    },
    contact: {
      contact_us: "Contact CodeCombat",
      welcome: "Good to hear from you! Use this form to send us email. ",
      forum_prefix: "For anything public, please try ",
      forum_page: "our forum",
      forum_suffix: " instead.",
      faq_prefix: "There's also a",
      faq: "FAQ",
      subscribe_prefix: "If you need help figuring out a level, please",
      subscribe: "buy a CodeCombat subscription",
      subscribe_suffix: "and we'll be happy to help you with your code.",
      subscriber_support: "Since you're a CodeCombat subscriber, your email will get our priority support.",
      screenshot_included: "Screenshot included.",
      where_reply: "Where should we reply?",
      send: "Send Feedback"
    },
    account_settings: {
      title: "Account Settings",
      not_logged_in: "Log in or create an account to change your settings.",
      autosave: "Changes Save Automatically",
      me_tab: "Me",
      picture_tab: "Picture",
      delete_account_tab: "Delete Your Account",
      wrong_email: "Wrong Email",
      wrong_password: "Wrong Password",
      upload_picture: "Upload a picture",
      delete_this_account: "Delete this account permanently",
      reset_progress_tab: "Reset All Progress",
      reset_your_progress: "Clear all your progress and start over",
      god_mode: "God Mode",
      emails_tab: "Emails",
      admin: "Admin",
      manage_subscription: "Click here to manage your subscription.",
      new_password: "New Password",
      new_password_verify: "Verify",
      type_in_email: "Type in your email or username to confirm account deletion.",
      type_in_email_progress: "Type in your email to confirm deleting your progress.",
      type_in_password: "Also, type in your password.",
      email_subscriptions: "Email Subscriptions",
      email_subscriptions_none: "No Email Subscriptions.",
      email_announcements: "Announcements",
      email_announcements_description: "Get emails on the latest news and developments at CodeCombat.",
      email_notifications: "Notifications",
      email_notifications_summary: "Controls for personalized, automatic email notifications related to your CodeCombat activity.",
      email_any_notes: "Any Notifications",
      email_any_notes_description: "Disable to stop all activity notification emails.",
      email_news: "News",
      email_recruit_notes: "Job Opportunities",
      email_recruit_notes_description: "If you play really well, we may contact you about getting you a (better) job.",
      contributor_emails: "Contributor Class Emails",
      contribute_prefix: "We're looking for people to join our party! Check out the ",
      contribute_page: "contribute page",
      contribute_suffix: " to find out more.",
      email_toggle: "Toggle All",
      error_saving: "Error Saving",
      saved: "Changes Saved",
      password_mismatch: "Password does not match.",
      password_repeat: "Please repeat your password."
    },
    keyboard_shortcuts: {
      keyboard_shortcuts: "Keyboard Shortcuts",
      space: "Space",
      enter: "Enter",
      press_enter: "press enter",
      escape: "Escape",
      shift: "Shift",
      run_code: "Run current code.",
      run_real_time: "Run in real time.",
      continue_script: "Continue past current script.",
      skip_scripts: "Skip past all skippable scripts.",
      toggle_playback: "Toggle play/pause.",
      scrub_playback: "Scrub back and forward through time.",
      single_scrub_playback: "Scrub back and forward through time by a single frame.",
      scrub_execution: "Scrub through current spell execution.",
      toggle_debug: "Toggle debug display.",
      toggle_grid: "Toggle grid overlay.",
      toggle_pathfinding: "Toggle pathfinding overlay.",
      beautify: "Beautify your code by standardizing its formatting.",
      maximize_editor: "Maximize/minimize code editor."
    },
    community: {
      main_title: "CodeCombat Community",
      introduction: "Check out the ways you can get involved below and decide what sounds the most fun. We look forward to working with you!",
      level_editor_prefix: "Use the CodeCombat",
      level_editor_suffix: "to create and edit levels. Users have created levels for their classes, friends, hackathons, students, and siblings. If create a new level sounds intimidating you can start by forking one of ours!",
      thang_editor_prefix: "We call units within the game 'thangs'. Use the",
      thang_editor_suffix: "to modify the CodeCombat source artwork. Allow units to throw projectiles, alter the direction of an animation, change a unit's hit points, or upload your own vector sprites.",
      article_editor_prefix: "See a mistake in some of our docs? Want to make some instructions for your own creations? Check out the",
      article_editor_suffix: "and help CodeCombat players get the most out of their playtime.",
      find_us: "Find us on these sites",
      social_github: "Check out all our code on GitHub",
      social_blog: "Read the CodeCombat blog on Sett",
      social_discource: "Join the discussion on our Discourse forum",
      social_facebook: "Like CodeCombat on Facebook",
      social_twitter: "Follow CodeCombat on Twitter",
      social_gplus: "Join CodeCombat on Google+",
      social_slack: "Chat with us in the public CodeCombat Slack channel",
      contribute_to_the_project: "Contribute to the project"
    },
    clans: {
      clan: "Clan",
      clans: "Clans",
      new_name: "New clan name",
      new_description: "New clan description",
      make_private: "Make clan private",
      subs_only: "subscribers only",
      create_clan: "Create New Clan",
      private_preview: "Preview",
      private_clans: "Private Clans",
      public_clans: "Public Clans",
      my_clans: "My Clans",
      clan_name: "Clan Name",
      name: "Name",
      chieftain: "Chieftain",
      edit_clan_name: "Edit Clan Name",
      edit_clan_description: "Edit Clan Description",
      edit_name: "edit name",
      edit_description: "edit description",
      "private": "(private)",
      summary: "Summary",
      average_level: "Average Level",
      average_achievements: "Average Achievements",
      delete_clan: "Delete Clan",
      leave_clan: "Leave Clan",
      join_clan: "Join Clan",
      invite_1: "Invite:",
      invite_2: "*Invite players to this Clan by sending them this link.",
      members: "Members",
      progress: "Progress",
      not_started_1: "not started",
      started_1: "started",
      complete_1: "complete",
      exp_levels: "Expand levels",
      rem_hero: "Remove Hero",
      status: "Status",
      complete_2: "Complete",
      started_2: "Started",
      not_started_2: "Not Started",
      view_solution: "Click to view solution.",
      view_attempt: "Click to view attempt.",
      latest_achievement: "Latest Achievement",
      playtime: "Playtime",
      last_played: "Last played",
      leagues_explanation: "Play in a league against other clan members in these multiplayer arena instances.",
      track_concepts1: "Track concepts",
      track_concepts2a: "learned by each student",
      track_concepts2b: "learned by each member",
      track_concepts3a: "Track levels completed for each student",
      track_concepts3b: "Track levels completed for each member",
      track_concepts4a: "See your students'",
      track_concepts4b: "See your members'",
      track_concepts5: "solutions",
      track_concepts6a: "Sort students by name or progress",
      track_concepts6b: "Sort members by name or progress",
      track_concepts7: "Requires invitation",
      track_concepts8: "to join",
      private_require_sub: "Private clans require a subscription to create or join."
    },
    courses: {
      course: "Course",
      courses: "courses",
      create_new_class: "Create New Class",
      not_enrolled: "You are not enrolled in this course.",
      visit_pref: "Please visit the",
      visit_suf: "page to enroll.",
      select_class: "Select one of your classes",
      unnamed: "*unnamed*",
      select: "Select",
      unnamed_class: "Unnamed Class",
      edit_settings: "edit class settings",
      edit_settings1: "Edit Class Settings",
      progress: "Class Progress",
      add_students: "Add Students",
      stats: "Statistics",
      total_students: "Total students:",
      average_time: "Average level play time:",
      total_time: "Total play time:",
      average_levels: "Average levels completed:",
      total_levels: "Total levels completed:",
      furthest_level: "Furthest level completed:",
      students: "Students",
      students1: "students",
      concepts: "Concepts",
      levels: "levels",
      played: "Played",
      play_time: "Play time:",
      completed: "Completed:",
      invite_students: "Invite students to join this class.",
      invite_link_header: "Link to join course",
      invite_link_p_1: "Give this link to students you would like to have join the course.",
      invite_link_p_2: "Or have us email them directly:",
      capacity_used: "Course slots used:",
      enter_emails: "Separate each email address by a line break or commas",
      send_invites: "Invite Students",
      creating_class: "Creating class...",
      purchasing_course: "Purchasing course...",
      buy_course: "Buy Course",
      buy_course1: "Buy this course",
      select_all_courses: "Select 'All Courses' for a 50% discount!",
      all_courses: "All Courses",
      number_programming_students: "Number of Programming Students",
      number_total_students: "Total Students in School/District",
      enter_number_students: "Enter the number of students you need for this class.",
      name_class: "Name your class",
      displayed_course_page: "This will be displayed on the course page for you and your students. It can be changed later.",
      buy: "Buy",
      purchasing_for: "You are purchasing a license for",
      creating_for: "You are creating a class for",
      "for": "for",
      receive_code: "Afterwards you will receive an unlock code to distribute to your students, which they can use to enroll in your class.",
      free_trial: "Free trial for teachers!",
      get_access: "to get individual access to all courses for evalutaion purposes.",
      questions: "Questions?",
      teachers_click: "Teachers Click Here",
      students_click: "Students Click Here",
      courses_on_coco: "Courses on CodeCombat",
      designed_to: "Courses are designed to introduce computer science concepts using CodeCombat's fun and engaging environment. CodeCombat levels are organized around key topics to encourage progressive learning, over the course of 5 hours.",
      more_in_less: "Learn more in less time",
      no_experience: "No coding experience necesssary",
      easy_monitor: "Easily monitor student progress",
      purchase_for_class: "Purchase a course for your entire class. It's easy to sign up your students!",
      see_the: "See the",
      more_info: "for more information.",
      choose_course: "Choose Your Course:",
      enter_code: "Enter an unlock code to join an existing class",
      enter_code1: "Enter unlock code",
      enroll: "Enroll",
      pick_from_classes: "Pick from your current classes",
      enter: "Enter",
      or: "Or",
      topics: "Topics",
      hours_content: "Hours of content:",
      get_free: "Get FREE course",
      enroll_paid: "Enroll Students in Paid Courses",
      you_have1: "You have",
      you_have2: "unused student licenses",
      use_one: "Use 1 student license for",
      use_multiple: "Use licenses for the following students:",
      already_enrolled: "already enrolled",
      licenses_remaining: "licenses remaining:",
      insufficient_enrollments: "insufficient student licenses",
      get_enrollments: "Get More Licenses",
      change_language: "Change Course Language",
      keep_using: "Keep Using",
      switch_to: "Switch To",
      greetings: "Greetings!",
      back_classrooms: "Back to my classrooms",
      back_courses: "Back to my courses",
      edit_details: "Edit class details",
      enrolled_courses: "enrolled in paid courses:",
      purchase_enrollments: "Purchase Student Licenses",
      remove_student: "remove student",
      assign: "Assign",
      to_assign: "to assign paid courses.",
      student: "Student",
      teacher: "Teacher",
      complete: "Complete",
      none: "None",
      play_campaign_title: "Play the Campaign",
      play_campaign_description: "You’re ready to take the next step! Explore hundreds of challenging levels, learn advanced programming skills, and compete in multiplayer arenas!",
      create_account_title: "Create an Account",
      create_account_description: "Sign up for a FREE CodeCombat account and gain access to more levels, more programming skills, and more fun!",
      preview_campaign_title: "Preview Campaign",
      preview_campaign_description: "Take a sneak peek at all that CodeCombat has to offer before signing up for your FREE account.",
      arena: "Arena",
      arena_soon_title: "Arena Coming Soon",
      arena_soon_description: "We are working on a multiplayer arena for classrooms at the end of",
      not_enrolled1: "Not enrolled",
      not_enrolled2: "Ask your teacher to enroll you in the next course.",
      next_course: "Next Course",
      coming_soon1: "Coming soon",
      coming_soon2: "We are hard at work making more courses for you!",
      available_levels: "Available Levels",
      welcome_to_courses: "Adventurers, welcome to Courses!",
      ready_to_play: "Ready to play?",
      start_new_game: "Start New Game",
      play_now_learn_header: "Play now to learn",
      play_now_learn_1: "basic syntax to control your character",
      play_now_learn_2: "while loops to solve pesky puzzles",
      play_now_learn_3: "strings & variables to customize actions",
      play_now_learn_4: "how to defeat an ogre (important life skills!)",
      welcome_to_page: "My Student Dashboard",
      completed_hoc: "Amazing! You've completed the Hour of Code course!",
      ready_for_more_header: "Ready for more? Play the campaign mode!",
      ready_for_more_1: "Use gems to unlock new items!",
      ready_for_more_2: "Play through brand new worlds and challenges",
      ready_for_more_3: "Learn even more programming!",
      saved_games: "Saved Games",
      hoc: "Hour of Code",
      my_classes: "Current Classes",
      class_added: "Class successfully added!",
      view_levels: "view all levels in course",
      join_class: "Join A Class",
      join_class_2: "Join class",
      ask_teacher_for_code: "Ask your teacher if you have a CodeCombat class code! If so, enter it below:",
      enter_c_code: "<Enter Class Code>",
      join: "Join",
      joining: "Joining class",
      course_complete: "Course Complete",
      play_arena: "Play Arena",
      view_project: "View Project",
      start: "Start",
      last_level: "Last level played",
      welcome_to_hoc: "Adventurers, welcome to our Hour of Code!",
      logged_in_as: "Logged in as:",
      not_you: "Not you?",
      welcome_back: "Hi adventurer, welcome back!",
      continue_playing: "Continue Playing",
      more_options: "More options:",
      option1_header: "Invite Students by Email",
      option1_body: "Note: If your students do not have email addresses, they can enter your unique Class Code when creating a Student Account to make email addresses optional.",
      thank_you_pref: "Thank you for your purchase! You can now assign",
      thank_you_suff: "more students to paid courses.",
      return_to_class: "Return to classroom",
      return_to_course_man: "Return to course management.",
      students_not_enrolled: "students not enrolled",
      total_all_classes: "Total Across All Classes",
      how_many_enrollments: "How many additional student licenses do you need?",
      each_student_access: "Each student in a class will get access to Courses 2-4 once they are enrolled in paid courses. You may assign each course to each student individually.",
      purchase_now: "Purchase Now",
      enrollments: "licenses",
      remove_student1: "Remove Student",
      are_you_sure: "Are you sure you want to remove this student from this class?",
      remove_description1: "Student will lose access to this classroom and assigned classes. Progress and gameplay is NOT lost, and the student can be added back to the classroom at any time.",
      remove_description2: "The activated paid license will not be returned.",
      keep_student: "Keep Student",
      removing_user: "Removing user",
      to_join_ask: "To join a class, ask your teacher for an unlock code.",
      join_this_class: "Join Class",
      enter_here: "<enter unlock code here>",
      successfully_joined: "Successfully joined",
      click_to_start: "Click here to start taking",
      my_courses: "My Courses",
      classroom: "Classroom",
      use_school_email: "use your school email if you have one",
      unique_name: "a unique name no one has chosen",
      pick_something: "pick something you can remember",
      class_code: "Class Code",
      optional_ask: "optional - ask your teacher to give you one!",
      optional_school: "optional - what school do you go to?",
      start_playing: "Start Playing",
      skip_this: "Skip this, I'll create an account later!",
      welcome: "Welcome",
      getting_started: "Getting Started with Courses",
      download_getting_started: "Download Getting Started Guide [PDF]",
      getting_started_1: "Create a new class by clicking the green 'Create New Class' button below.",
      getting_started_2: "Once you've created a class, click the blue 'Add Students' button.",
      getting_started_3: "You'll see student's progress below as they sign up and join your class.",
      educator_wiki_pref: "Or check out our new",
      educator_wiki_mid: "educator wiki",
      educator_wiki_suff: "to browse the guide online.",
      your_classes: "Your Classes",
      no_classes: "No classes yet!",
      create_new_class1: "create new class",
      available_courses: "Available Courses",
      unused_enrollments: "Unused licenses available:",
      students_access: "All students get access to Introduction to Computer Science for free. One license per student is required to assign them to paid CodeCombat courses. A single student does not need multiple licenses to access all paid courses.",
      active_courses: "active courses",
      no_students: "No students yet!",
      add_students1: "add students",
      view_edit: "view/edit",
      students_enrolled: "students enrolled",
      students_assigned: "students assigned",
      length: "Length:",
      subtitle: "Review course overviews and levels",
      changelog: "View latest changes to course levels.",
      select_language: "Select language",
      select_level: "Select level",
      play_level: "Play Level",
      concepts_covered: "Concepts covered",
      print_guide: "Print Guide (PDF)",
      view_guide_online: "Level Overviews and Solutions",
      grants_lifetime_access: "Grants access to all Courses.",
      enrollment_credits_available: "Licenses Available:",
      language_select: "Select a language",
      language_cannot_change: "Language cannot be changed once students join a class.",
      learn_p: "Learn Python",
      learn_j: "Learn JavaScript",
      avg_student_exp_label: "Average Student Programming Experience",
      avg_student_exp_desc: "This will help us understand how to pace courses better.",
      avg_student_exp_select: "Select the best option",
      avg_student_exp_none: "No Experience - little to no experience",
      avg_student_exp_beginner: "Beginner - some exposure or block-based",
      avg_student_exp_intermediate: "Intermediate - some experience with typed code",
      avg_student_exp_advanced: "Advanced - extensive experience with typed code",
      avg_student_exp_varied: "Varied Levels of Experience",
      student_age_range_label: "Student Age Range",
      student_age_range_younger: "Younger than 6",
      student_age_range_older: "Older than 18",
      student_age_range_to: "to",
      create_class: "Create Class",
      class_name: "Class Name",
      teacher_account_restricted: "Your account is a teacher account and cannot access student content.",
      account_restricted: "A student account is required to access this page.",
      update_account_login_title: "Log in to update your account",
      update_account_title: "Your account needs attention!",
      update_account_blurb: "Before you can access your classes, choose how you want to use this account.",
      update_account_current_type: "Current Account Type:",
      update_account_account_email: "Account Email/Username:",
      update_account_am_teacher: "I am a teacher",
      update_account_keep_access: "Keep access to classes I've created",
      update_account_teachers_can: "Teacher accounts can:",
      update_account_teachers_can1: "Create/manage/add classes",
      update_account_teachers_can2: "Assign/enroll students in courses",
      update_account_teachers_can3: "Unlock all course levels to try out",
      update_account_teachers_can4: "Access new teacher-only features as we release them",
      update_account_teachers_warning: "Warning: You will be removed from all classes that you have previously joined and will not be able to play as a student.",
      update_account_remain_teacher: "Remain a Teacher",
      update_account_update_teacher: "Update to Teacher",
      update_account_am_student: "I am a student",
      update_account_remove_access: "Remove access to classes I have created",
      update_account_students_can: "Student accounts can:",
      update_account_students_can1: "Join classes",
      update_account_students_can2: "Play through courses as a student and track your own progress",
      update_account_students_can3: "Compete against classmates in arenas",
      update_account_students_can4: "Access new student-only features as we release them",
      update_account_students_warning: "Warning: You will not be able to manage any classes that you have previously created or create new classes.",
      update_account_remain_student: "Remain a Student",
      update_account_update_student: "Update to Student",
      need_a_class_code: "You'll need a Class Code for the class you're joining:",
      update_account_not_sure: "Not sure which one to choose? Email",
      update_account_confirm_update_student: "Are you sure you want to update your account to a Student experience?",
      update_account_confirm_update_student2: "You will not be able to manage any classes that you have previously created or create new classes. Your previously created classes will be removed from CodeCombat and cannot be restored.",
      instructor: "Instructor: ",
      youve_been_invited_1: "You've been invited to join ",
      youve_been_invited_2: ", where you'll learn ",
      youve_been_invited_3: " with your classmates in CodeCombat.",
      by_joining_1: "By joining ",
      by_joining_2: "will be able to help reset your password if you forget or lose it. You can also verify your email address so that you can reset the password yourself!",
      sent_verification: "We've sent a verification email to:",
      you_can_edit: "You can edit your email address in ",
      account_settings: "Account Settings",
      select_your_hero: "Select Your Hero",
      select_your_hero_description: "You can always change your hero by going to your Courses page and clicking \"Change Hero\"",
      select_this_hero: "Select this Hero",
      current_hero: "Current Hero:",
      change_hero: "Change Hero",
      web_dev_language_transition: "All classes program in HTML / JavaScript for this course.  Classes that have been using Python will start with extra JavaScript intro levels to ease the transition.  Classes that are already using JavaScript will skip the intro levels."
    },
    teacher: {
      course_solution: "Course Solution",
      level_overview_solutions: "Level Overview and Solutions",
      teacher_dashboard: "Teacher Dashboard",
      my_classes: "My Classes",
      courses: "Course Guides",
      enrollments: "Student Licenses",
      resources: "Resources",
      help: "Help",
      students: "Students",
      language: "Language",
      edit_class_settings: "edit class settings",
      complete: "Complete",
      access_restricted: "Account Update Required",
      teacher_account_required: "A teacher account is required to access this content.",
      create_teacher_account: "Create Teacher Account",
      what_is_a_teacher_account: "What's a Teacher Account?",
      teacher_account_explanation: "A CodeCombat Teacher account allows you to set up classrooms, monitor students’ progress as they work through courses, manage licenses and access resources to aid in your curriculum-building.",
      current_classes: "Current Classes",
      archived_classes: "Archived Classes",
      archived_classes_blurb: "Classes can be archived for future reference. Unarchive a class to view it in the Current Classes list again.",
      view_class: "view class",
      archive_class: "archive class",
      unarchive_class: "unarchive class",
      unarchive_this_class: "Unarchive this class",
      no_students_yet: "This class has no students yet.",
      no_students_yet_view_class: "View class to add students.",
      try_refreshing: "(You may need to refresh the page)",
      add_students: "Add Students",
      create_new_class: "Create a New Class",
      class_overview: "Class Overview",
      avg_playtime: "Average level playtime",
      total_playtime: "Total play time",
      avg_completed: "Average levels completed",
      total_completed: "Total levels completed",
      created: "Created",
      concepts_covered: "Concepts covered",
      earliest_incomplete: "Earliest incomplete level",
      latest_complete: "Latest completed level",
      enroll_student: "Enroll student",
      apply_license: "Apply License",
      course_progress: "Course Progress",
      not_applicable: "N/A",
      edit: "edit",
      edit_2: "Edit",
      remove: "remove",
      latest_completed: "Latest completed:",
      sort_by: "Sort by",
      progress: "Progress",
      completed: "Completed",
      started: "Started",
      click_to_view_progress: "click to view progress",
      no_progress: "No progress",
      select_course: "Select course to view",
      students_not_assigned: "Students who have not been assigned {{courseName}}",
      course_overview: "Course Overview",
      copy_class_code: "Copy Class Code",
      class_code_blurb: "Students can join your class using this Class Code. No email address is required when creating a Student account with this Class Code.",
      copy_class_url: "Copy Class URL",
      class_join_url_blurb: "You can also post this unique class URL to a shared webpage.",
      add_students_manually: "Invite Students by Email",
      bulk_assign: "Bulk-assign",
      assigned_msg_1: "{{numberAssigned}} students were assigned {{courseName}}.",
      assigned_msg_2: "{{numberEnrolled}} licenses were applied.",
      assigned_msg_3: "You now have {{remainingSpots}} available licenses remaining.",
      assign_course: "Assign Course",
      not_assigned_modal_title: "Courses were not assigned",
      not_assigned_modal_body_1: "You do not have enough licenses available to assign additional Courses to all {{selected}} selected students.",
      not_assigned_modal_body_2: "You only have {{totalSpotsAvailable}} licenses available ({{unenrolledStudents}} students did not have an active license).",
      not_assigned_modal_body_3: "Please select fewer students, or reach out to {{email}} for assistance.",
      assign_to_selected_students: "Assign to Selected Students",
      assigned: "Assigned",
      enroll_selected_students: "Enroll Selected Students",
      no_students_selected: "No students were selected.",
      guides_coming_soon: "Guides coming soon!",
      show_students_from: "Show students from",
      apply_licenses_to_the_following_students: "Apply Licenses to the Following Students",
      students_have_licenses: "The following students already have licenses applied:",
      all_students: "All Students",
      apply_licenses: "Apply Licenses",
      not_enough_enrollments: "Not enough licenses available.",
      enrollments_blurb: "Students are required to have a license to access any content after the first course.",
      credits_available: "Licenses Available",
      total_unique_students: "Total Students",
      total_enrolled_students: "Enrolled Students",
      unenrolled_students: "Unenrolled Students",
      add_enrollment_credits: "Add Licenses",
      purchasing: "Purchasing...",
      purchased: "Purchased!",
      purchase_now: "Purchase Now",
      how_to_enroll: "How to Enroll Students",
      how_to_apply_licenses: "How to Apply Licenses",
      bulk_pricing_blurb: "Purchasing for more than 25 students? Contact us to discuss next steps.",
      total_unenrolled: "Total unenrolled",
      export_student_progress: "Export Student Progress (CSV)",
      send_email_to: "Send Recover Password Email to:",
      email_sent: "Email sent",
      send_recovery_email: "Send recovery email",
      enter_new_password_below: "Enter new password below:",
      change_password: "Change Password",
      changed: "Changed",
      available_credits: "Available Licenses",
      pending_credits: "Pending Licenses",
      credits: "licenses",
      start_date: "start date:",
      end_date: "end date:",
      get_enrollments_blurb: " We'll help you build a solution that meets the needs of your class, school or district.",
      how_to_apply_licenses_blurb_1: "When a teacher assigns a course to a student for the first time, we’ll automatically apply a license. Use the bulk-assign dropdown in your classroom to assign a course to selected students:",
      how_to_apply_licenses_blurb_2: "Can I still apply a license without assigning a course?",
      how_to_apply_licenses_blurb_3: "Yes — go to the License Status tab in your classroom and click \"Apply License\" to any student who does not have an active license.",
      request_sent: "Request Sent!",
      enrollment_status: "Enrollment Status",
      license_status: "License Status",
      status_expired: "Expired on {{date}}",
      status_not_enrolled: "Not Enrolled",
      status_enrolled: "Expires on {{date}}",
      select_all: "Select All",
      projects: "Projects",
      project: "Project",
      view_student_project: "View Student Project",
      view_arena_ladder: "View Arena Ladder",
      resource_hub: "Resource Hub",
      getting_started: "Getting Started",
      educator_faq: "Educator FAQ",
      educator_faq_desc: "Frequently asked questions about using CodeCombat in your classroom or school.",
      teacher_getting_started: "Teacher Getting Started Guide",
      teacher_getting_started_desc: "New to CodeCombat? Download this Teacher Getting Started Guide to set up your account, create your first class, and invite students to the first course.",
      student_getting_started: "Student Quick Start Guide",
      student_getting_started_desc: "You can distribute this guide to your students before starting CodeCombat so that they can familiarize themselves with the code editor. This guide can be used for both Python and JavaScript classrooms.",
      cs1: "Introduction to Computer Science",
      cs2: "Computer Science 2",
      cs3: "Computer Science 3",
      cs1_syntax_python: "Course 1 Python Syntax Guide",
      cs1_syntax_python_desc: "Cheatsheet with references to common Python syntax that students will learn in Introduction to Computer Science.",
      cs1_syntax_javascript: "Course 1 JavaScript Syntax Guide",
      cs1_syntax_javascript_desc: "Cheatsheet with references to common JavaScript syntax that students will learn in Introduction to Computer Science.",
      coming_soon: "Additional guides coming soon!",
      engineering_cycle_worksheet: "Engineering Cycle Worksheet",
      engineering_cycle_worksheet_desc: "Use this worksheet to teach students the basics of the engineering cycle: Assess, Design, Implement and Debug. Refer to the completed example worksheet as a guide.",
      engineering_cycle_worksheet_link: "View example",
      progress_journal: "Progress Journal",
      progress_journal_desc: "Encourage students to keep track of their progress via a progress journal.",
      cs1_curriculum: "Introduction to Computer Science - Curriculum Guide",
      cs1_curriculum_desc: "Scope and sequence, lesson plans, activities and more for Course 1.",
      cs2_curriculum: "Computer Science 2 - Curriculum Guide",
      cs2_curriculum_desc: "Scope and sequence, lesson plans, activities and more for Course 2.",
      cs3_curriculum: "Computer Science 3 - Curriculum Guide",
      cs3_curriculum_desc: "Scope and sequence, lesson plans, activities and more for Course 3.",
      cs1_pairprogramming: "Pair Programming Activity",
      cs1_pairprogramming_desc: "Introduce students to a pair programming exercise that will help them become better listeners and communicators.",
      unlock_resources: "Unlock more resources!",
      unlock_resources_desc: "Gain access to additional guides by adding student licenses to your account. Request a demo today to get started.",
      request_demo: "Request Demo",
      student_overview: "Overview",
      student_email: "Student Email",
      no_email: "Student has no email address set.",
      student_profile: "Student Profile",
      playtime_detail: "Playtime Detail",
      student_completed: "Student Completed",
      student_in_progress: "Student in Progress",
      class_average: "Class Average",
      not_assigned: "has not been assigned the following courses",
      playtime_axis: "Playtime in Seconds",
      levels_axis: "Levels in",
      student_state: "How is",
      student_state_2: "doing?",
      student_good: "is doing well in",
      student_good_detail: "This student is keeping pace with the class.",
      student_warn: "might need some help in",
      student_warn_detail: "This student might need some help with new concepts that have been introduced in this course.",
      student_great: "is doing great in",
      student_great_detail: "This student might be a good candidate to help other students working through this course."
    },
    sharing: {
      game: "Game",
      webpage: "Webpage",
      your_students_preview: "Your students will click here to see their finished projects! Unavailable in teacher preview.",
      unavailable: "Link sharing not available in teacher preview.",
      share_game: "Share This Game",
      share_web: "Share This Webpage",
      victory_share_prefix: "Share this link to invite your friends & family to",
      victory_share_game: "play your game level",
      victory_share_web: "view your webpage",
      victory_share_suffix: ".",
      victory_course_share_prefix: "This link will let your friends & family",
      victory_course_share_game: "play the game",
      victory_course_share_web: "view the webpage",
      victory_course_share_suffix: "you just created.",
      copy_url: "Copy URL"
    },
    game_dev: {
      creator: "Creator"
    },
    web_dev: {
      image_gallery_title: "Image Gallery",
      select_an_image: "Select an image you want to use",
      scroll_down_for_more_images: "(Scroll down for more images)",
      copy_the_url: "Copy the URL below",
      copy_the_url_description: "Useful if you want to replace an existing image.",
      copy_the_img_tag: "Copy the <img> tag",
      copy_the_img_tag_description: "Useful if you want to insert a new image.",
      copy_url: "Copy URL",
      copy_img: "Copy <img>",
      how_to_copy_paste: "How to Copy/Paste",
      copy: "Copy",
      paste: "Paste",
      back_to_editing: "Back to Editing"
    },
    classes: {
      archmage_title: "Archmage",
      archmage_title_description: "(Coder)",
      archmage_summary: "If you are a developer interested in coding educational games, become an archmage to help us build CodeCombat!",
      artisan_title: "Artisan",
      artisan_title_description: "(Level Builder)",
      artisan_summary: "Build and share levels for you and your friends to play. Become an Artisan to learn the art of teaching others to program.",
      adventurer_title: "Adventurer",
      adventurer_title_description: "(Level Playtester)",
      adventurer_summary: "Get our new levels (even our subscriber content) for free one week early and help us work out bugs before our public release.",
      scribe_title: "Scribe",
      scribe_title_description: "(Article Editor)",
      scribe_summary: "Good code needs good documentation. Write, edit, and improve the docs read by millions of players across the globe.",
      diplomat_title: "Diplomat",
      diplomat_title_description: "(Translator)",
      diplomat_summary: "CodeCombat is localized in 45+ languages by our Diplomats. Help us out and contribute translations.",
      ambassador_title: "Ambassador",
      ambassador_title_description: "(Support)",
      ambassador_summary: "Tame our forum users and provide direction for those with questions. Our ambassadors represent CodeCombat to the world.",
      teacher_title: "Teacher"
    },
    editor: {
      main_title: "CodeCombat Editors",
      article_title: "Article Editor",
      thang_title: "Thang Editor",
      level_title: "Level Editor",
      course_title: "Course Editor",
      achievement_title: "Achievement Editor",
      poll_title: "Poll Editor",
      back: "Back",
      revert: "Revert",
      revert_models: "Revert Models",
      pick_a_terrain: "Pick A Terrain",
      dungeon: "Dungeon",
      indoor: "Indoor",
      desert: "Desert",
      grassy: "Grassy",
      mountain: "Mountain",
      glacier: "Glacier",
      small: "Small",
      large: "Large",
      fork_title: "Fork New Version",
      fork_creating: "Creating Fork...",
      generate_terrain: "Generate Terrain",
      more: "More",
      wiki: "Wiki",
      live_chat: "Live Chat",
      thang_main: "Main",
      thang_spritesheets: "Spritesheets",
      thang_colors: "Colors",
      level_some_options: "Some Options?",
      level_tab_thangs: "Thangs",
      level_tab_scripts: "Scripts",
      level_tab_components: "Components",
      level_tab_systems: "Systems",
      level_tab_docs: "Documentation",
      level_tab_thangs_title: "Current Thangs",
      level_tab_thangs_all: "All",
      level_tab_thangs_conditions: "Starting Conditions",
      level_tab_thangs_add: "Add Thangs",
      level_tab_thangs_search: "Search thangs",
      add_components: "Add Components",
      component_configs: "Component Configurations",
      config_thang: "Double click to configure a thang",
      "delete": "Delete",
      duplicate: "Duplicate",
      stop_duplicate: "Stop Duplicate",
      rotate: "Rotate",
      level_component_tab_title: "Current Components",
      level_component_btn_new: "Create New Component",
      level_systems_tab_title: "Current Systems",
      level_systems_btn_new: "Create New System",
      level_systems_btn_add: "Add System",
      level_components_title: "Back to All Thangs",
      level_components_type: "Type",
      level_component_edit_title: "Edit Component",
      level_component_config_schema: "Config Schema",
      level_system_edit_title: "Edit System",
      create_system_title: "Create New System",
      new_component_title: "Create New Component",
      new_component_field_system: "System",
      new_article_title: "Create a New Article",
      new_thang_title: "Create a New Thang Type",
      new_level_title: "Create a New Level",
      new_article_title_login: "Log In to Create a New Article",
      new_thang_title_login: "Log In to Create a New Thang Type",
      new_level_title_login: "Log In to Create a New Level",
      new_achievement_title: "Create a New Achievement",
      new_achievement_title_login: "Log In to Create a New Achievement",
      new_poll_title: "Create a New Poll",
      new_poll_title_login: "Log In to Create a New Poll",
      article_search_title: "Search Articles Here",
      thang_search_title: "Search Thang Types Here",
      level_search_title: "Search Levels Here",
      achievement_search_title: "Search Achievements",
      poll_search_title: "Search Polls",
      read_only_warning2: "Note: you can't save any edits here, because you're not logged in.",
      no_achievements: "No achievements have been added for this level yet.",
      achievement_query_misc: "Key achievement off of miscellanea",
      achievement_query_goals: "Key achievement off of level goals",
      level_completion: "Level Completion",
      pop_i18n: "Populate I18N",
      tasks: "Tasks",
      clear_storage: "Clear your local changes",
      add_system_title: "Add Systems to Level",
      done_adding: "Done Adding"
    },
    article: {
      edit_btn_preview: "Preview",
      edit_article_title: "Edit Article"
    },
    polls: {
      priority: "Priority"
    },
    contribute: {
      page_title: "Contributing",
      intro_blurb: "CodeCombat is 100% open source! Hundreds of dedicated players have helped us build the game into what it is today. Join us and write the next chapter in CodeCombat's quest to teach the world to code!",
      alert_account_message_intro: "Hey there!",
      alert_account_message: "To subscribe for class emails, you'll need to be logged in first.",
      archmage_introduction: "One of the best parts about building games is they synthesize so many different things. Graphics, sound, real-time networking, social networking, and of course many of the more common aspects of programming, from low-level database management, and server administration to user facing design and interface building. There's a lot to do, and if you're an experienced programmer with a hankering to really dive into the nitty-gritty of CodeCombat, this class might be for you. We would love to have your help building the best programming game ever.",
      class_attributes: "Class Attributes",
      archmage_attribute_1_pref: "Knowledge in ",
      archmage_attribute_1_suf: ", or a desire to learn. Most of our code is in this language. If you're a fan of Ruby or Python, you'll feel right at home. It's JavaScript, but with a nicer syntax.",
      archmage_attribute_2: "Some experience in programming and personal initiative. We'll help you get oriented, but we can't spend much time training you.",
      how_to_join: "How To Join",
      join_desc_1: "Anyone can help out! Just check out our ",
      join_desc_2: "to get started, and check the box below to mark yourself as a brave Archmage and get the latest news by email. Want to chat about what to do or how to get more deeply involved? ",
      join_desc_3: ", or find us in our ",
      join_desc_4: "and we'll go from there!",
      join_url_email: "Email us",
      join_url_slack: "public Slack channel",
      archmage_subscribe_desc: "Get emails on new coding opportunities and announcements.",
      artisan_introduction_pref: "We must construct additional levels! People be clamoring for more content, and we can only build so many ourselves. Right now your workstation is level one; our level editor is barely usable even by its creators, so be wary. If you have visions of campaigns spanning for-loops to",
      artisan_introduction_suf: ", then this class might be for you.",
      artisan_attribute_1: "Any experience in building content like this would be nice, such as using Blizzard's level editors. But not required!",
      artisan_attribute_2: "A hankering to do a whole lot of testing and iteration. To make good levels, you need to take it to others and watch them play it, and be prepared to find a lot of things to fix.",
      artisan_attribute_3: "For the time being, endurance en par with an Adventurer. Our Level Editor is super preliminary and frustrating to use. You have been warned!",
      artisan_join_desc: "Use the Level Editor in these steps, give or take:",
      artisan_join_step1: "Read the documentation.",
      artisan_join_step2: "Create a new level and explore existing levels.",
      artisan_join_step3: "Find us in our public Slack channel for help.",
      artisan_join_step4: "Post your levels on the forum for feedback.",
      artisan_subscribe_desc: "Get emails on level editor updates and announcements.",
      adventurer_introduction: "Let's be clear about your role: you are the tank. You're going to take heavy damage. We need people to try out brand-new levels and help identify how to make things better. The pain will be enormous; making good games is a long process and no one gets it right the first time. If you can endure and have a high constitution score, then this class might be for you.",
      adventurer_attribute_1: "A thirst for learning. You want to learn how to code and we want to teach you how to code. You'll probably be doing most of the teaching in this case, though.",
      adventurer_attribute_2: "Charismatic. Be gentle but articulate about what needs improving, and offer suggestions on how to improve.",
      adventurer_join_pref: "Either get together with (or recruit!) an Artisan and work with them, or check the box below to receive emails when there are new levels to test. We'll also be posting about levels to review on our networks like",
      adventurer_forum_url: "our forum",
      adventurer_join_suf: "so if you prefer to be notified those ways, sign up there!",
      adventurer_subscribe_desc: "Get emails when there are new levels to test.",
      scribe_introduction_pref: "CodeCombat isn't just going to be a bunch of levels. It will also include a resource for knowledge, a wiki of programming concepts that levels can hook into. That way rather than each Artisan having to describe in detail what a comparison operator is, they can simply link their level to the Article describing them that is already written for the player's edification. Something along the lines of what the ",
      scribe_introduction_url_mozilla: "Mozilla Developer Network",
      scribe_introduction_suf: " has built. If your idea of fun is articulating the concepts of programming in Markdown form, then this class might be for you.",
      scribe_attribute_1: "Skill in words is pretty much all you need. Not only grammar and spelling, but able to convey complicated ideas to others.",
      contact_us_url: "Contact Us",
      scribe_join_description: "tell us a little about yourself, your experience with programming and what sort of things you'd like to write about. We'll go from there!",
      scribe_subscribe_desc: "Get emails about article writing announcements.",
      diplomat_introduction_pref: "So, if there's one thing we learned from the ",
      diplomat_launch_url: "launch in October",
      diplomat_introduction_suf: "it's that there is sizeable interest in CodeCombat in other countries! We're building a corps of translators eager to turn one set of words into another set of words to get CodeCombat as accessible across the world as possible. If you like getting sneak peeks at upcoming content and getting these levels to your fellow nationals ASAP, then this class might be for you.",
      diplomat_attribute_1: "Fluency in English and the language you would like to translate to. When conveying complicated ideas, it's important to have a strong grasp in both!",
      diplomat_i18n_page_prefix: "You can start translating our levels by going to our",
      diplomat_i18n_page: "translations page",
      diplomat_i18n_page_suffix: ", or our interface and website on GitHub.",
      diplomat_join_pref_github: "Find your language locale file ",
      diplomat_github_url: "on GitHub",
      diplomat_join_suf_github: ", edit it online, and submit a pull request. Also, check this box below to keep up-to-date on new internationalization developments!",
      diplomat_subscribe_desc: "Get emails about i18n developments and levels to translate.",
      ambassador_introduction: "This is a community we're building, and you are the connections. We've got forums, emails, and social networks with lots of people to talk with and help get acquainted with the game and learn from. If you want to help people get involved and have fun, and get a good feel of the pulse of CodeCombat and where we're going, then this class might be for you.",
      ambassador_attribute_1: "Communication skills. Be able to identify the problems players are having and help them solve them. Also, keep the rest of us informed about what players are saying, what they like and don't like and want more of!",
      ambassador_join_desc: "tell us a little about yourself, what you've done and what you'd be interested in doing. We'll go from there!",
      ambassador_join_note_strong: "Note",
      ambassador_join_note_desc: "One of our top priorities is to build multiplayer where players having difficulty solving levels can summon higher level wizards to help them. This will be a great way for ambassadors to do their thing. We'll keep you posted!",
      ambassador_subscribe_desc: "Get emails on support updates and multiplayer developments.",
      teacher_subscribe_desc: "Get emails on updates and announcements for teachers.",
      changes_auto_save: "Changes are saved automatically when you toggle checkboxes.",
      diligent_scribes: "Our Diligent Scribes:",
      powerful_archmages: "Our Powerful Archmages:",
      creative_artisans: "Our Creative Artisans:",
      brave_adventurers: "Our Brave Adventurers:",
      translating_diplomats: "Our Translating Diplomats:",
      helpful_ambassadors: "Our Helpful Ambassadors:"
    },
    ladder: {
      please_login: "Please log in first before playing a ladder game.",
      my_matches: "My Matches",
      simulate: "Simulate",
      simulation_explanation: "By simulating games you can get your game ranked faster!",
      simulation_explanation_leagues: "You will mainly help simulate games for allied players in your clans and courses.",
      simulate_games: "Simulate Games!",
      games_simulated_by: "Games simulated by you:",
      games_simulated_for: "Games simulated for you:",
      games_in_queue: "Games currently in the queue:",
      games_simulated: "Games simulated",
      games_played: "Games played",
      ratio: "Ratio",
      leaderboard: "Leaderboard",
      battle_as: "Battle as ",
      summary_your: "Your ",
      summary_matches: "Matches - ",
      summary_wins: " Wins, ",
      summary_losses: " Losses",
      rank_no_code: "No New Code to Rank",
      rank_my_game: "Rank My Game!",
      rank_submitting: "Submitting...",
      rank_submitted: "Submitted for Ranking",
      rank_failed: "Failed to Rank",
      rank_being_ranked: "Game Being Ranked",
      rank_last_submitted: "submitted ",
      help_simulate: "Help simulate games?",
      code_being_simulated: "Your new code is being simulated by other players for ranking. This will refresh as new matches come in.",
      no_ranked_matches_pre: "No ranked matches for the ",
      no_ranked_matches_post: " team! Play against some competitors and then come back here to get your game ranked.",
      choose_opponent: "Choose an Opponent",
      select_your_language: "Select your language!",
      tutorial_play: "Play Tutorial",
      tutorial_recommended: "Recommended if you've never played before",
      tutorial_skip: "Skip Tutorial",
      tutorial_not_sure: "Not sure what's going on?",
      tutorial_play_first: "Play the Tutorial first.",
      simple_ai: "Simple CPU",
      warmup: "Warmup",
      friends_playing: "Friends Playing",
      log_in_for_friends: "Log in to play with your friends!",
      social_connect_blurb: "Connect and play against your friends!",
      invite_friends_to_battle: "Invite your friends to join you in battle!",
      fight: "Fight!",
      watch_victory: "Watch your victory",
      defeat_the: "Defeat the",
      watch_battle: "Watch the battle",
      tournament_started: ", started",
      tournament_ends: "Tournament ends",
      tournament_ended: "Tournament ended",
      tournament_rules: "Tournament Rules",
      tournament_blurb: "Write code, collect gold, build armies, crush foes, win prizes, and upgrade your career in our $40,000 Greed tournament! Check out the details",
      tournament_blurb_criss_cross: "Win bids, construct paths, outwit opponents, grab gems, and upgrade your career in our Criss-Cross tournament! Check out the details",
      tournament_blurb_zero_sum: "Unleash your coding creativity in both gold gathering and battle tactics in this alpine mirror match between red sorcerer and blue sorcerer. The tournament began on Friday, March 27 and will run until Monday, April 6 at 5PM PDT. Compete for fun and glory! Check out the details",
      tournament_blurb_ace_of_coders: "Battle it out in the frozen glacier in this domination-style mirror match! The tournament began on Wednesday, September 16 and will run until Wednesday, October 14 at 5PM PDT. Check out the details",
      tournament_blurb_blog: "on our blog",
      rules: "Rules",
      winners: "Winners",
      league: "League",
      red_ai: "Red CPU",
      blue_ai: "Blue CPU",
      wins: "Wins",
      humans: "Red",
      ogres: "Blue"
    },
    user: {
      stats: "Stats",
      singleplayer_title: "Singleplayer Levels",
      multiplayer_title: "Multiplayer Levels",
      achievements_title: "Achievements",
      last_played: "Last Played",
      status: "Status",
      status_completed: "Completed",
      status_unfinished: "Unfinished",
      no_singleplayer: "No Singleplayer games played yet.",
      no_multiplayer: "No Multiplayer games played yet.",
      no_achievements: "No Achievements earned yet.",
      favorite_prefix: "Favorite language is ",
      favorite_postfix: ".",
      not_member_of_clans: "Not a member of any clans yet."
    },
    achievements: {
      last_earned: "Last Earned",
      amount_achieved: "Amount",
      achievement: "Achievement",
      current_xp_prefix: "",
      current_xp_postfix: " in total",
      new_xp_prefix: "",
      new_xp_postfix: " earned",
      left_xp_prefix: "",
      left_xp_infix: " until level ",
      left_xp_postfix: ""
    },
    account: {
      payments: "Payments",
      prepaid_codes: "Prepaid Codes",
      purchased: "Purchased",
      subscription: "Subscription",
      invoices: "Invoices",
      service_apple: "Apple",
      service_web: "Web",
      paid_on: "Paid On",
      service: "Service",
      price: "Price",
      gems: "Gems",
      active: "Active",
      subscribed: "Subscribed",
      unsubscribed: "Unsubscribed",
      active_until: "Active Until",
      cost: "Cost",
      next_payment: "Next Payment",
      card: "Card",
      status_unsubscribed_active: "You're not subscribed and won't be billed, but your account is still active for now.",
      status_unsubscribed: "Get access to new levels, heroes, items, and bonus gems with a CodeCombat subscription!",
      not_yet_verified: "Not yet verified.",
      resend_email: "Resend email",
      email_sent: "Email sent! Check your inbox.",
      verifying_email: "Verifying your email address...",
      successfully_verified: "You've successfully verified your email address!",
      back_to_student_page: "Go back to student things",
      back_to_teacher_page: "Go to My Classes",
      back_to_game: "Go play some more levels!",
      verify_error: "Something went wrong when verifying your email :("
    },
    account_invoices: {
      amount: "Amount in US dollars",
      declined: "Your card was declined",
      invalid_amount: "Please enter a US dollar amount.",
      not_logged_in: "Log in or create an account to access invoices.",
      pay: "Pay Invoice",
      purchasing: "Purchasing...",
      retrying: "Server error, retrying.",
      success: "Successfully paid. Thanks!"
    },
    account_prepaid: {
      purchase_code: "Purchase a Subscription Code",
      purchase_code1: "Subscription Codes can be redeemed to add premium subscription time to one or more CodeCombat accounts.",
      purchase_code2: "Each CodeCombat account can only redeem a particular Subscription Code once.",
      purchase_code3: "Subscription Code months will be added to the end of any existing subscription on the account.",
      users: "Users",
      months: "Months",
      purchase_total: "Total",
      purchase_button: "Submit Purchase",
      your_codes: "Your Codes",
      redeem_codes: "Redeem a Subscription Code",
      prepaid_code: "Prepaid Code",
      lookup_code: "Lookup prepaid code",
      apply_account: "Apply to your account",
      copy_link: "You can copy the code's link and send it to someone.",
      quantity: "Quantity",
      redeemed: "Redeemed",
      no_codes: "No codes yet!",
      you_can1: "You can",
      you_can2: "purchase a prepaid code",
      you_can3: "that can be applied to your own account or given to others."
    },
    coppa_deny: {
      text1: "Can’t wait to learn programming?",
      text2: "Your parents will need to create an account for you to use! Email team@codecombat.com if you have any questions.",
      close: "Close Window"
    },
    loading_error: {
      could_not_load: "Error loading from server",
      connection_failure: "Connection Failed",
      connection_failure_desc: "It doesn’t look like you’re connected to the internet! Check your network connection and then reload this page.",
      login_required: "Login Required",
      login_required_desc: "You need to be logged in to access this page.",
      unauthorized: "You need to be signed in. Do you have cookies disabled?",
      forbidden: "Forbidden",
      forbidden_desc: "Oh no, there’s nothing we can show you here! Make sure you’re logged into the correct account, or visit one of the links below to get back to programming!",
      not_found: "Not Found",
      not_found_desc: "Hm, there’s nothing here. Visit one of the following links to get back to programming!",
      not_allowed: "Method not allowed.",
      timeout: "Server Timeout",
      conflict: "Resource conflict.",
      bad_input: "Bad input.",
      server_error: "Server error.",
      unknown: "Unknown Error",
      error: "ERROR",
      general_desc: "Something went wrong, and it’s probably our fault. Try waiting a bit and then refreshing the page, or visit one of the following links to get back to programming!"
    },
    resources: {
      level: "Level",
      patch: "Patch",
      patches: "Patches",
      system: "System",
      systems: "Systems",
      component: "Component",
      components: "Components",
      hero: "Hero",
      campaigns: "Campaigns"
    },
    concepts: {
      advanced_strings: "Advanced Strings",
      algorithms: "Algorithms",
      "arguments": "Arguments",
      arithmetic: "Arithmetic",
      arrays: "Arrays",
      basic_syntax: "Basic Syntax",
      boolean_logic: "Boolean Logic",
      break_statements: "Break Statements",
      classes: "Classes",
      continue_statements: "Continue Statements",
      for_loops: "For Loops",
      functions: "Functions",
      graphics: "Graphics",
      if_statements: "If Statements",
      input_handling: "Input Handling",
      math_operations: "Math Operations",
      object_literals: "Object Literals",
      parameters: "Parameters",
      strings: "Strings",
      variables: "Variables",
      vectors: "Vectors",
      while_loops: "While Loops",
      recursion: "Recursion",
      basic_html: "Basic HTML",
      basic_css: "Basic CSS",
      basic_web_scripting: "Basic Web Scripting",
      intermediate_html: "Intermediate HTML",
      intermediate_css: "Intermediate CSS",
      intermediate_web_scripting: "Intermediate Web Scripting",
      advanced_html: "Advanced HTML",
      advanced_css: "Advanced CSS",
      advanced_web_scripting: "Advanced Web Scripting",
      jquery: "jQuery",
      bootstrap: "Bootstrap"
    },
    delta: {
      added: "Added",
      modified: "Modified",
      not_modified: "Not Modified",
      deleted: "Deleted",
      moved_index: "Moved Index",
      text_diff: "Text Diff",
      merge_conflict_with: "MERGE CONFLICT WITH",
      no_changes: "No Changes"
    },
    legal: {
      page_title: "Legal",
      opensource_intro: "CodeCombat is completely open source.",
      opensource_description_prefix: "Check out ",
      github_url: "our GitHub",
      opensource_description_center: "and help out if you like! CodeCombat is built on dozens of open source projects, and we love them. See ",
      archmage_wiki_url: "our Archmage wiki",
      opensource_description_suffix: "for a list of the software that makes this game possible.",
      practices_title: "Respectful Best Practices",
      practices_description: "These are our promises to you, the player, in slightly less legalese.",
      privacy_title: "Privacy",
      privacy_description: "We will not sell any of your personal information.",
      security_title: "Security",
      security_description: "We strive to keep your personal information safe. As an open source project, our site is freely open to anyone to review and improve our security systems.",
      email_title: "Email",
      email_description_prefix: "We will not inundate you with spam. Through",
      email_settings_url: "your email settings",
      email_description_suffix: "or through links in the emails we send, you can change your preferences and easily unsubscribe at any time.",
      cost_title: "Cost",
      cost_description: "CodeCombat is free to play for all of its core levels, with a ${{price}} USD/mo subscription for access to extra level branches and {{gems}} bonus gems per month. You can cancel with a click, and we offer a 100% money-back guarantee.",
      copyrights_title: "Copyrights and Licenses",
      contributor_title: "Contributor License Agreement",
      contributor_description_prefix: "All contributions, both on the site and on our GitHub repository, are subject to our",
      cla_url: "CLA",
      contributor_description_suffix: "to which you should agree before contributing.",
      code_title: "Code - MIT",
      code_description_prefix: "All code owned by CodeCombat or hosted on codecombat.com, both in the GitHub repository or in the codecombat.com database, is licensed under the",
      mit_license_url: "MIT license",
      code_description_suffix: "This includes all code in Systems and Components that are made available by CodeCombat for the purpose of creating levels.",
      art_title: "Art/Music - Creative Commons ",
      art_description_prefix: "All common content is available under the",
      cc_license_url: "Creative Commons Attribution 4.0 International License",
      art_description_suffix: "Common content is anything made generally available by CodeCombat for the purpose of creating Levels. This includes:",
      art_music: "Music",
      art_sound: "Sound",
      art_artwork: "Artwork",
      art_sprites: "Sprites",
      art_other: "Any and all other non-code creative works that are made available when creating Levels.",
      art_access: "Currently there is no universal, easy system for fetching these assets. In general, fetch them from the URLs as used by the site, contact us for assistance, or help us in extending the site to make these assets more easily accessible.",
      art_paragraph_1: "For attribution, please name and link to codecombat.com near where the source is used or where appropriate for the medium. For example:",
      use_list_1: "If used in a movie or another game, include codecombat.com in the credits.",
      use_list_2: "If used on a website, include a link near the usage, for example underneath an image, or in a general attributions page where you might also mention other Creative Commons works and open source software being used on the site. Something that's already clearly referencing CodeCombat, such as a blog post mentioning CodeCombat, does not need some separate attribution.",
      art_paragraph_2: "If the content being used is created not by CodeCombat but instead by a user of codecombat.com, attribute them instead, and follow attribution directions provided in that resource's description if there are any.",
      rights_title: "Rights Reserved",
      rights_desc: "All rights are reserved for Levels themselves. This includes",
      rights_scripts: "Scripts",
      rights_unit: "Unit configuration",
      rights_writings: "Writings",
      rights_media: "Media (sounds, music) and any other creative content made specifically for that Level and not made generally available when creating Levels.",
      rights_clarification: "To clarify, anything that is made available in the Level Editor for the purpose of making levels is under CC, whereas the content created with the Level Editor or uploaded in the course of creation of Levels is not.",
      nutshell_title: "In a Nutshell",
      nutshell_description: "Any resources we provide in the Level Editor are free to use as you like for creating Levels. But we reserve the right to restrict distribution of the Levels themselves (that are created on codecombat.com) so that they may be charged for.",
      canonical: "The English version of this document is the definitive, canonical version. If there are any discrepancies between translations, the English document takes precedence.",
      third_party_title: "Third Party Services",
      third_party_description: "CodeCombat uses the following third party services (among others):"
    },
    ladder_prizes: {
      title: "Tournament Prizes",
      blurb_1: "These prizes will be awarded according to",
      blurb_2: "the tournament rules",
      blurb_3: "to the top human and ogre players.",
      blurb_4: "Two teams means double the prizes!",
      blurb_5: "(There will be two first place winners, two second-place winners, etc.)",
      rank: "Rank",
      prizes: "Prizes",
      total_value: "Total Value",
      in_cash: "in cash",
      custom_wizard: "Custom CodeCombat Wizard",
      custom_avatar: "Custom CodeCombat avatar",
      heap: "for six months of \"Startup\" access",
      credits: "credits",
      one_month_coupon: "coupon: choose either Rails or HTML",
      one_month_discount: "discount, 30% off: choose either Rails or HTML",
      license: "license",
      oreilly: "ebook of your choice"
    },
    calendar: {
      year: "Year",
      day: "Day",
      month: "Month",
      january: "January",
      february: "February",
      march: "March",
      april: "April",
      may: "May",
      june: "June",
      july: "July",
      august: "August",
      september: "September",
      october: "October",
      november: "November",
      december: "December"
    }
  }
};
});

;require.register("lib/sprites/SpriteBuilder", function(exports, require, module) {
var SpriteBuilder, hexToHSL, hslToHex, ref, sum,
  slice = [].slice;

ref = require('core/utils'), hexToHSL = ref.hexToHSL, hslToHex = ref.hslToHex;

module.exports = SpriteBuilder = (function() {
  function SpriteBuilder(thangType, options) {
    var raw;
    this.thangType = thangType;
    this.options = options;
    if (this.options == null) {
      this.options = {};
    }
    raw = this.thangType.get('raw');
    this.shapeStore = raw.shapes;
    this.containerStore = raw.containers;
    this.animationStore = raw.animations;
    this.buildColorMaps();
  }

  SpriteBuilder.prototype.setOptions = function(options) {
    this.options = options;
  };

  SpriteBuilder.prototype.buildMovieClip = function(animationName, mode, startPosition, loops, labels) {
    var anim, animData, args, bounds, func, i, j, len, len1, locals, ref1, stopped, tween, tweenData;
    animData = this.animationStore[animationName];
    if (!animData) {
      console.error('couldn\'t find animData from', this.animationStore, 'for', animationName);
      return null;
    }
    locals = {};
    _.extend(locals, this.buildMovieClipShapes(animData.shapes));
    _.extend(locals, this.buildMovieClipContainers(animData.containers));
    _.extend(locals, this.buildMovieClipAnimations(animData.animations));
    _.extend(locals, this.buildMovieClipGraphics(animData.graphics));
    anim = new createjs.MovieClip();
    if (!labels) {
      labels = {};
      labels[animationName] = 0;
    }
    anim.initialize(mode != null ? mode : createjs.MovieClip.INDEPENDENT, startPosition != null ? startPosition : 0, loops != null ? loops : true, labels);
    ref1 = animData.tweens;
    for (i = 0, len = ref1.length; i < len; i++) {
      tweenData = ref1[i];
      tween = createjs.Tween;
      stopped = false;
      for (j = 0, len1 = tweenData.length; j < len1; j++) {
        func = tweenData[j];
        args = _.cloneDeep(func.a);
        this.dereferenceArgs(args, locals);
        if (tween[func.n]) {
          tween = tween[func.n].apply(tween, args);
        } else {
          stopped = true;
          break;
        }
      }
      if (!stopped) {
        anim.timeline.addTween(tween);
      }
    }
    anim.nominalBounds = (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(createjs.Rectangle, animData.bounds, function(){});
    if (animData.frameBounds) {
      anim.frameBounds = (function() {
        var k, len2, ref2, results;
        ref2 = animData.frameBounds;
        results = [];
        for (k = 0, len2 = ref2.length; k < len2; k++) {
          bounds = ref2[k];
          results.push((function(func, args, ctor) {
            ctor.prototype = func.prototype;
            var child = new ctor, result = func.apply(child, args);
            return Object(result) === result ? result : child;
          })(createjs.Rectangle, bounds, function(){}));
        }
        return results;
      })();
    }
    return anim;
  };

  SpriteBuilder.prototype.dereferenceArgs = function(args, locals) {
    var key, val;
    for (key in args) {
      val = args[key];
      if (locals[val]) {
        args[key] = locals[val];
      } else if (val === null) {
        args[key] = {};
      } else if (_.isString(val) && val.indexOf('createjs.') === 0) {
        args[key] = eval(val);
      } else if (_.isObject(val) || _.isArray(val)) {
        this.dereferenceArgs(val, locals);
      }
    }
    return args;
  };

  SpriteBuilder.prototype.buildMovieClipShapes = function(localShapes) {
    var i, len, localShape, map, shape;
    map = {};
    for (i = 0, len = localShapes.length; i < len; i++) {
      localShape = localShapes[i];
      if (localShape.im) {
        shape = new createjs.Shape();
        shape._off = true;
      } else {
        shape = this.buildShapeFromStore(localShape.gn);
        if (localShape.m) {
          shape.mask = map[localShape.m];
        }
      }
      map[localShape.bn] = shape;
    }
    return map;
  };

  SpriteBuilder.prototype.buildMovieClipContainers = function(localContainers) {
    var container, i, len, localContainer, map;
    map = {};
    for (i = 0, len = localContainers.length; i < len; i++) {
      localContainer = localContainers[i];
      container = this.buildContainerFromStore(localContainer.gn);
      container.setTransform.apply(container, localContainer.t);
      if (localContainer.o != null) {
        container._off = localContainer.o;
      }
      if (localContainer.al != null) {
        container.alpha = localContainer.al;
      }
      map[localContainer.bn] = container;
    }
    return map;
  };

  SpriteBuilder.prototype.buildMovieClipAnimations = function(localAnimations) {
    var animation, i, len, localAnimation, map;
    map = {};
    for (i = 0, len = localAnimations.length; i < len; i++) {
      localAnimation = localAnimations[i];
      animation = this.buildMovieClip.apply(this, [localAnimation.gn].concat(slice.call(localAnimation.a)));
      animation.setTransform.apply(animation, localAnimation.t);
      map[localAnimation.bn] = animation;
    }
    return map;
  };

  SpriteBuilder.prototype.buildMovieClipGraphics = function(localGraphics) {
    var graphic, i, len, localGraphic, map;
    map = {};
    for (i = 0, len = localGraphics.length; i < len; i++) {
      localGraphic = localGraphics[i];
      graphic = new createjs.Graphics().p(localGraphic.p);
      map[localGraphic.bn] = graphic;
    }
    return map;
  };

  SpriteBuilder.prototype.buildShapeFromStore = function(shapeKey, debug) {
    var ref1, ref2, ref3, ref4, ref5, shape, shapeData;
    if (debug == null) {
      debug = false;
    }
    shapeData = this.shapeStore[shapeKey];
    shape = new createjs.Shape();
    if (shapeData.lf != null) {
      (ref1 = shape.graphics).lf.apply(ref1, shapeData.lf);
    } else if (shapeData.fc != null) {
      shape.graphics.f(this.colorMap[shapeKey] || shapeData.fc);
    } else if (shapeData.rf != null) {
      (ref2 = shape.graphics).rf.apply(ref2, shapeData.rf);
    }
    if (shapeData.ls != null) {
      (ref3 = shape.graphics).ls.apply(ref3, shapeData.ls);
    } else if (shapeData.sc != null) {
      shape.graphics.s(shapeData.sc);
    }
    if (shapeData.ss != null) {
      (ref4 = shape.graphics).ss.apply(ref4, shapeData.ss);
    }
    if (shapeData.de != null) {
      (ref5 = shape.graphics).de.apply(ref5, shapeData.de);
    }
    if (shapeData.p != null) {
      shape.graphics.p(shapeData.p);
    }
    shape.setTransform.apply(shape, shapeData.t);
    return shape;
  };

  SpriteBuilder.prototype.buildContainerFromStore = function(containerKey) {
    var child, childData, cont, contData, i, len, ref1;
    if (!containerKey) {
      console.error('Yo we don\'t have no containerKey');
    }
    contData = this.containerStore[containerKey];
    cont = new createjs.Container();
    cont.initialize();
    ref1 = contData.c;
    for (i = 0, len = ref1.length; i < len; i++) {
      childData = ref1[i];
      if (_.isString(childData)) {
        child = this.buildShapeFromStore(childData);
      } else {
        if (!childData.gn) {
          continue;
        }
        child = this.buildContainerFromStore(childData.gn);
        child.setTransform.apply(child, childData.t);
      }
      cont.addChild(child);
    }
    cont.bounds = (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(createjs.Rectangle, contData.b, function(){});
    return cont;
  };

  SpriteBuilder.prototype.buildColorMaps = function() {
    var colorConfig, colorGroups, config, group, results;
    this.colorMap = {};
    colorGroups = this.thangType.get('colorGroups');
    if (_.isEmpty(colorGroups)) {
      return;
    }
    if (!_.size(this.shapeStore)) {
      return;
    }
    colorConfig = this.options.colorConfig;
    if (!colorConfig) {
      return;
    }
    results = [];
    for (group in colorConfig) {
      config = colorConfig[group];
      if (!colorGroups[group]) {
        continue;
      }
      results.push(this.buildColorMapForGroup(colorGroups[group], config));
    }
    return results;
  };

  SpriteBuilder.prototype.buildColorMapForGroup = function(shapes, config) {
    var colors;
    if (!shapes.length) {
      return;
    }
    colors = this.initColorMap(shapes);
    this.adjustHuesForColorMap(colors, config.hue);
    this.adjustValueForColorMap(colors, 1, config.saturation);
    this.adjustValueForColorMap(colors, 2, config.lightness);
    return this.applyColorMap(shapes, colors);
  };

  SpriteBuilder.prototype.initColorMap = function(shapes) {
    var colors, hsl, i, len, shape, shapeKey;
    colors = {};
    for (i = 0, len = shapes.length; i < len; i++) {
      shapeKey = shapes[i];
      shape = this.shapeStore[shapeKey];
      if ((shape.fc == null) || colors[shape.fc]) {
        continue;
      }
      hsl = hexToHSL(shape.fc);
      colors[shape.fc] = hsl;
    }
    return colors;
  };

  SpriteBuilder.prototype.adjustHuesForColorMap = function(colors, targetHue) {
    var averageHue, diff, h, hex, hsl, hues, results;
    hues = (function() {
      var results;
      results = [];
      for (hex in colors) {
        hsl = colors[hex];
        results.push(hsl[0]);
      }
      return results;
    })();
    if (Math.max(hues) - Math.min(hues) > 0.5) {
      hues = ((function() {
        var i, len, results;
        if (h < 0.5) {
          return h + 1.0;
        } else {
          results = [];
          for (i = 0, len = hues.length; i < len; i++) {
            h = hues[i];
            results.push(h);
          }
          return results;
        }
      })());
    }
    averageHue = sum(hues) / hues.length;
    averageHue %= 1;
    if (targetHue == null) {
      targetHue = 0;
    }
    diff = targetHue - averageHue;
    results = [];
    for (hex in colors) {
      hsl = colors[hex];
      results.push(hsl[0] = (hsl[0] + diff + 1) % 1);
    }
    return results;
  };

  SpriteBuilder.prototype.adjustValueForColorMap = function(colors, index, targetValue) {
    var averageValue, diff, hex, hsl, results, values;
    values = (function() {
      var results;
      results = [];
      for (hex in colors) {
        hsl = colors[hex];
        results.push(hsl[index]);
      }
      return results;
    })();
    averageValue = sum(values) / values.length;
    if (targetValue == null) {
      targetValue = 0.5;
    }
    diff = targetValue - averageValue;
    results = [];
    for (hex in colors) {
      hsl = colors[hex];
      results.push(hsl[index] = Math.max(0, Math.min(1, hsl[index] + diff)));
    }
    return results;
  };

  SpriteBuilder.prototype.applyColorMap = function(shapes, colors) {
    var i, len, results, shape, shapeKey;
    results = [];
    for (i = 0, len = shapes.length; i < len; i++) {
      shapeKey = shapes[i];
      shape = this.shapeStore[shapeKey];
      if ((shape.fc == null) || !colors[shape.fc]) {
        continue;
      }
      results.push(this.colorMap[shapeKey] = hslToHex(colors[shape.fc]));
    }
    return results;
  };

  return SpriteBuilder;

})();

sum = function(nums) {
  return _.reduce(nums, function(s, num) {
    return s + num;
  });
};
});

;require.register("templates/core/achievement-popup", function(exports, require, module) {
var __templateData = function anonymous(locals
/**/) {
var buf = [];
var locals_ = (locals || {}),style = locals_.style,locked = locals_.locked,imgURL = locals_.imgURL,title = locals_.title,description = locals_.description,popup = locals_.popup,level = locals_.level,$ = locals_.$,currentXP = locals_.currentXP,newXP = locals_.newXP,leftXP = locals_.leftXP,oldXPWidth = locals_.oldXPWidth,newXPWidth = locals_.newXPWidth,leftXPWidth = locals_.leftXPWidth;var addedClass = style + (locked === true ? ' locked' : '')
buf.push("<div" + (jade.attrs({ "class": [('clearfix'),('achievement-body'),(addedClass)] }, {"class":true})) + "><div class=\"achievement-icon\"><div class=\"achievement-image\"><img" + (jade.attrs({ 'src':(imgURL) }, {"src":true})) + "/></div></div><div class=\"achievement-content\"><div class=\"achievement-title\">" + (jade.escape(null == (jade.interp = title) ? "" : jade.interp)) + "</div><p class=\"achievement-description\">" + (jade.escape(null == (jade.interp = description) ? "" : jade.interp)) + "</p>");
if ( popup)
{
buf.push("<div class=\"progress-wrapper\"><span class=\"user-level\">" + (jade.escape(null == (jade.interp = level) ? "" : jade.interp)) + "</span><div class=\"progress-bar-wrapper\"><div class=\"progress\">");
var currentTitle = $.i18n.t('achievements.current_xp_prefix') + currentXP + ' XP' + $.i18n.t('achievements.current_xp_postfix');
var newTitle = $.i18n.t('achievements.new_xp_prefix') + newXP + ' XP' + $.i18n.t('achievements.new_xp_postfix');
var leftTitle = $.i18n.t('achievements.left_xp_prefix') + leftXP + ' XP' + $.i18n.t('achievements.left_xp_infix') + (level+1) + $.i18n.t('achievements.left_xp_postfix');
buf.push("<div" + (jade.attrs({ 'style':("width:" + (oldXPWidth) + "%"), 'data-toggle':("tooltip"), 'data-placement':("top"), 'title':("" + (currentTitle) + ""), "class": [('progress-bar'),('xp-bar-old')] }, {"style":true,"data-toggle":true,"data-placement":true,"title":true})) + "></div><div" + (jade.attrs({ 'style':("width:" + (newXPWidth) + "%"), 'data-toggle':("tooltip"), 'title':("" + (newTitle) + ""), "class": [('progress-bar'),('xp-bar-new')] }, {"style":true,"data-toggle":true,"title":true})) + "></div><div" + (jade.attrs({ 'style':("width:" + (leftXPWidth) + "%"), 'data-toggle':("tooltip"), 'title':("" + (leftTitle) + ""), "class": [('progress-bar'),('xp-bar-left')] }, {"style":true,"data-toggle":true,"title":true})) + "></div></div></div><div class=\"progress-bar-border\"></div></div>");
}
buf.push("</div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/core/auth-modal-gplus-checklist", function(exports, require, module) {
var __templateData = function anonymous(locals
/**/) {
var buf = [];
var locals_ = (locals || {}),steps = locals_.steps;buf.push("<ul class=\"list-group\">");
// iterate steps
;(function(){
  var $$obj = steps;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var step = $$obj[$index];

buf.push("<li" + (jade.attrs({ "class": [('list-group-item'),(step.done ? 'list-group-item-success' : 'list-group-item-warning')] }, {"class":true})) + "><span" + (jade.attrs({ 'data-i18n':(step.i18n) }, {"data-i18n":true})) + "></span>");
if ( step.done)
{
buf.push("<span class=\"glyphicon glyphicon-ok pull-right\"></span>");
}
buf.push("</li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var step = $$obj[$index];

buf.push("<li" + (jade.attrs({ "class": [('list-group-item'),(step.done ? 'list-group-item-success' : 'list-group-item-warning')] }, {"class":true})) + "><span" + (jade.attrs({ 'data-i18n':(step.i18n) }, {"data-i18n":true})) + "></span>");
if ( step.done)
{
buf.push("<span class=\"glyphicon glyphicon-ok pull-right\"></span>");
}
buf.push("</li>");
    }

  }
}).call(this);

buf.push("</ul>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/core/auth-modal", function(exports, require, module) {
var __templateData = function anonymous(locals
/**/) {
var buf = [];
var locals_ = (locals || {}),showRequiredError = locals_.showRequiredError,view = locals_.view,translate = locals_.translate;buf.push("<div class=\"modal-dialog\"><div class=\"modal-content\"><img src=\"/images/pages/modal/auth/login-background.png\" draggable=\"false\" class=\"auth-modal-background\"/><h1 data-i18n=\"login.log_in\"></h1><div id=\"close-modal\"><span class=\"glyphicon glyphicon-remove\"></span></div></div><div class=\"auth-form-content\">");
if ( showRequiredError)
{
buf.push("<div class=\"alert alert-success\"><span data-i18n=\"signup.required\"></span></div>");
}
buf.push("<div id=\"unknown-error-alert\" data-i18n=\"loading_error.unknown\" class=\"alert alert-danger hide\"></div><form class=\"form\"><div class=\"form-group\"><label for=\"username-or-email-input\" class=\"control-label\"><span data-i18n=\"login.email_or_username\"></span>:</label><div class=\"input-border\"><input" + (jade.attrs({ 'id':('username-or-email-input'), 'name':("emailOrUsername"), 'value':(view.previousFormInputs.email), "class": [('input-large'),('form-control')] }, {"name":true,"value":true})) + "/></div></div><div class=\"form-group\"><div id=\"recover-account-wrapper\"><a id=\"link-to-recover\" data-toggle=\"coco-modal\" data-target=\"core/RecoverModal\" data-i18n=\"login.forgot_password\"></a></div><label for=\"password\" class=\"control-label\"><span data-i18n=\"general.password\"></span>:</label><div class=\"input-border\"><input" + (jade.attrs({ 'id':('password-input'), 'name':("password"), 'type':("password"), 'value':(view.previousFormInputs.password), "class": [('input-large'),('form-control')] }, {"name":true,"type":true,"value":true})) + "/></div></div><input" + (jade.attrs({ 'id':('login-btn'), 'value':(translate("login.log_in")), 'type':("submit"), "class": [('btn'),('btn-lg'),('btn-illustrated'),('btn-block'),('btn-success')] }, {"value":true,"type":true})) + "/></form><div class=\"wait secret\"><h3 data-i18n=\"login.logging_in\"></h3></div></div><div class=\"auth-network-logins\"><!-- GitHub login complete, but the button does not fit in with the design yet. Hidden for now--><!--div.network-login--><!--  btn.btn.btn-sm.github-login-button#github-login-button--><!--    img(src=\"/images/pages/modal/auth/github_icon.png\")--><!--    | GitHub--><button id=\"facebook-login-btn\" disabled=\"disabled\" class=\"btn btn-primary btn-lg btn-illustrated network-login\"><img src=\"/images/pages/community/logo_facebook.png\" draggable=\"false\" class=\"network-logo\"/><span data-i18n=\"login.sign_in_with_facebook\" class=\"sign-in-blurb\"></span></button><button id=\"gplus-login-btn\" disabled=\"disabled\" class=\"btn btn-danger btn-lg btn-illustrated network-login\"><img src=\"/images/pages/community/logo_g+.png\" draggable=\"false\" class=\"network-logo\"/><span data-i18n=\"login.sign_in_with_gplus\" class=\"sign-in-blurb\"></span><div class=\"gplus-login-wrapper\"><div class=\"gplus-login-button\"></div></div></button></div><div class=\"extra-pane\"><div data-i18n=\"login.signup_switch\" class=\"switch-explanation\"></div><div id=\"switch-to-signup-btn\" data-i18n=\"login.sign_up\" class=\"btn btn-lg btn-illustrated btn-warning\"></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/core/contact", function(exports, require, module) {
var __templateData = function anonymous(locals
/**/) {
var buf = [];
var locals_ = (locals || {}),view = locals_.view,me = locals_.me;buf.push("<div class=\"modal-dialog game\"><div class=\"background-wrapper\"><div class=\"modal-content\"><div class=\"modal-header\">");
if ( view.closeButton)
{
buf.push("<div type=\"button\" data-dismiss=\"modal\" aria-hidden=\"true\" class=\"button close\">&times;</div>");
}
buf.push("<h3 data-i18n=\"contact.contact_us\">Contact CodeCombat...</h3></div><div class=\"modal-body\"><p><span data-i18n=\"contact.welcome\">Good to hear from you! Use this form to send us email. </span><span data-i18n=\"contact.forum_prefix\" class=\"spl\">For anything public, please try </span><a href=\"http://discourse.codecombat.com/\" data-i18n=\"contact.forum_page\">our forum</a><span data-i18n=\"contact.forum_suffix\"> instead.</span><span data-i18n=\"contact.faq_prefix\" class=\"spl spr\">There's also a</span><a data-i18n=\"contact.faq\" href=\"http://discourse.codecombat.com/t/faq-check-before-posting/1027\">FAQ</a>.</p>");
if ( me.isPremium())
{
buf.push("<p data-i18n=\"contact.subscriber_support\">Since you're a CodeCombat subscriber, your email will get our priority support.</p>");
}
else
{
buf.push("<p><span data-i18n=\"contact.subscribe_prefix\" class=\"spr\">If you need help figuring out a level, please</span><a data-toggle=\"coco-modal\" data-target=\"core/SubscribeModal\" data-i18n=\"contact.subscribe\">buy a CodeCombat subscription</a><span data-i18n=\"contact.subscribe_suffix\" class=\"spl\">and we'll be happy to help you with your code.</span></p>");
}
buf.push("<div class=\"form\"><div class=\"form-group\"><label for=\"contact-email\" data-i18n=\"general.email\" class=\"control-label\">Email      </label><input" + (jade.attrs({ 'id':('contact-email'), 'name':("email"), 'type':("email"), 'value':("" + (me.get('anonymous') ? '' : me.get('email')) + ""), 'data-i18n':("[placeholder]contact.where_reply"), 'placeholder':("Where should we reply?"), "class": [('form-control')] }, {"name":true,"type":true,"value":true,"data-i18n":true,"placeholder":true})) + "/></div><div class=\"form-group\"><label for=\"contact-message\" data-i18n=\"general.message\" class=\"control-label\">Message      </label><textarea id=\"contact-message\" name=\"message\" rows=\"8\" class=\"form-control\"></textarea></div></div><div id=\"contact-screenshot\" class=\"secret\"><a target=\"_blank\" data-i18n=\"contact.screenshot_included\">Screenshot included.</a><br/><img width=\"100\" class=\"pull-left\"/></div></div><div class=\"modal-body wait secret\"><h3>Reticulating Splines...</h3><div class=\"progress progress-striped active\"><div class=\"progress-bar\"></div></div></div><div class=\"modal-footer\"><span data-i18n=\"common.sending\" class=\"sending-indicator pull-left secret\">Sending...</span><a href=\"#\" data-dismiss=\"modal\" aria-hidden=\"true\" data-i18n=\"common.cancel\" class=\"btn\">Cancel</a><button id=\"contact-submit-button\" data-i18n=\"contact.send\" class=\"btn btn-primary\">Send Feedback</button></div></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/core/create-account-modal/basic-info-view", function(exports, require, module) {
var __templateData = function anonymous(locals
/**/) {
var buf = [];
var locals_ = (locals || {}),view = locals_.view;buf.push("<form id=\"basic-info-form\" class=\"modal-body basic-info\"><div class=\"modal-body-content\"><div class=\"auth-network-logins text-center\"><h4><span data-i18n=\"signup.connect_with\"></span></h4><a" + (jade.attrs({ 'id':('facebook-signup-btn'), 'disabled':(!view.signupState.get('facebookEnabled')), 'data-sso-used':("facebook"), "class": [('btn'),('btn-primary'),('btn-lg'),('btn-illustrated'),('network-login')] }, {"disabled":true,"data-sso-used":true})) + "><img src=\"/images/pages/modal/auth/facebook_sso_button.png\" draggable=\"false\" width=\"175\" height=\"40\" class=\"network-logo\"/><span data-i18n=\"login.sign_in_with_facebook\" class=\"sign-in-blurb\"></span></a><a" + (jade.attrs({ 'id':('gplus-signup-btn'), 'disabled':(!view.signupState.get('gplusEnabled')), 'data-sso-used':("gplus"), "class": [('btn'),('btn-danger'),('btn-lg'),('btn-illustrated'),('network-login')] }, {"disabled":true,"data-sso-used":true})) + "><img src=\"/images/pages/modal/auth/gplus_sso_button.png\" draggable=\"false\" width=\"175\" height=\"40\" class=\"network-logo\"/><span data-i18n=\"login.sign_in_with_gplus\" class=\"sign-in-blurb\"></span><div class=\"gplus-login-wrapper\"><div class=\"gplus-login-button\"></div></div></a></div><div class=\"hr-text\"><hr/><span data-i18n=\"general.or\"></span></div><div class=\"form-container\">");
if ( ['student', 'teacher'].indexOf(view.signupState.get('path')) !== -1)
{
buf.push("<div class=\"row full-name\"><div class=\"col-xs-offset-3 col-xs-5\"><div class=\"form-group\"><label for=\"first-name-input\" class=\"control-label\"><span data-i18n=\"general.first_name\"></span></label><input id=\"first-name-input\" name=\"firstName\" class=\"form-control input-lg\"/></div></div><div class=\"col-xs-4\"><div class=\"last-initial form-group\"><label for=\"last-name-input\" class=\"control-label\"><span data-i18n=\"general.last_initial\"></span></label><input id=\"last-name-input\" name=\"lastName\" maxlength=\"1\" class=\"form-control input-lg\"/></div></div></div>");
}
buf.push("<div class=\"form-group\"><div class=\"row\"><div class=\"col-xs-5 col-xs-offset-3\"><label for=\"email-input\" class=\"control-label\"><span data-i18n=\"share_progress_modal.form_label\"></span></label>");
if ( view.signupState.get('path') === 'student')
{
buf.push("<div class=\"help-block optional-help-block pull-right\"><span data-i18n=\"signup.optional\"></span></div>");
}
buf.push("<input id=\"email-input\" name=\"email\" type=\"email\" class=\"form-control input-lg\"/></div><div class=\"col-xs-4 email-check fancy-error\">");
var checkEmailState = view.state.get('checkEmailState');
if ( checkEmailState === 'checking')
{
buf.push("<span data-i18n=\"signup.checking\" class=\"small\"></span>");
}
if ( checkEmailState === 'exists')
{
buf.push("<span class=\"small\"><span class=\"text-burgandy glyphicon glyphicon-remove-circle\"></span>" + (jade.escape(null == (jade.interp = " ") ? "" : jade.interp)) + "<span data-i18n=\"signup.account_exists\"></span>" + (jade.escape(null == (jade.interp = " ") ? "" : jade.interp)) + "<a data-i18n=\"signup.sign_in\" class=\"login-link\"></a></span>");
}
if ( checkEmailState === 'available')
{
buf.push("<span class=\"small\"><span class=\"text-forest glyphicon glyphicon-ok-circle\"></span>" + (jade.escape(null == (jade.interp = " ") ? "" : jade.interp)) + "<span data-i18n=\"signup.email_good\"></span></span>");
}
buf.push("</div></div></div><div class=\"form-group\"><div class=\"row\"><div class=\"col-xs-5 col-xs-offset-3\"><label for=\"username-input\" class=\"control-label\"><span data-i18n=\"general.username\"></span></label><input id=\"username-input\" name=\"name\" class=\"form-control input-lg\"/></div><div class=\"col-xs-4 name-check fancy-error\">");
var checkNameState = view.state.get('checkNameState');
if ( checkNameState === 'checking')
{
buf.push("<span data-i18n=\"signup.checking\" class=\"small\"></span>");
}
if ( checkNameState === 'exists')
{
buf.push("<span class=\"small\"><span class=\"text-burgandy glyphicon glyphicon-remove-circle\"></span>" + (jade.escape(null == (jade.interp = " ") ? "" : jade.interp)) + "<span>" + (jade.escape(null == (jade.interp = view.state.get('suggestedNameText')) ? "" : jade.interp)) + "</span></span>");
}
if ( checkNameState === 'available')
{
buf.push("<span class=\"small\"><span class=\"text-forest glyphicon glyphicon-ok-circle\"></span>" + (jade.escape(null == (jade.interp = " ") ? "" : jade.interp)) + "<span data-i18n=\"signup.name_available\"></span></span>");
}
buf.push("</div></div></div><div class=\"form-group\"><div class=\"row\"><div class=\"col-xs-5 col-xs-offset-3\"><label for=\"password-input\" class=\"control-label\"><span data-i18n=\"general.password\"></span></label><input id=\"password-input\" name=\"password\" type=\"password\" class=\"form-control input-lg\"/></div></div></div><div class=\"form-group checkbox subscribe\"><div class=\"row\"><div class=\"col-xs-7 col-xs-offset-3\"><div class=\"checkbox\"><label><input id=\"subscribe-input\" type=\"checkbox\" checked=\"checked\" name=\"subscribe\"/><span data-i18n=\"signup.email_announcements\"></span></label></div></div></div></div><div class=\"error-area\">");
var error = view.state.get('error');
if ( error)
{
buf.push("<div class=\"row\"><div class=\"col-xs-7 col-xs-offset-3\"></div></div><div class=\"alert alert-danger\">" + (jade.escape(null == (jade.interp = error) ? "" : jade.interp)) + "</div>");
}
buf.push("</div></div></div><!-- In reverse order for tabbing purposes--><div class=\"history-nav-buttons\"><button id=\"create-account-btn\" type=\"submit\" class=\"next-button btn btn-lg btn-navy\"><span data-i18n=\"login.sign_up\"></span></button><button type=\"button\" class=\"back-button btn btn-lg btn-navy-alt\"><span data-i18n=\"common.back\"></span></button></div></form>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/core/create-account-modal/choose-account-type-view", function(exports, require, module) {
var __templateData = function anonymous(locals
/**/) {
var buf = [];
buf.push("<div class=\"modal-body-content\"><h4 class=\"choose-type-title\"><span data-i18n=\"signup.choose_type\"></span></h4><div class=\"path-cards\"><div class=\"path-card navy\"><div class=\"card-title\"><span data-i18n=\"courses.teacher\"></span></div><div class=\"card-content\"><h6 class=\"card-description\"><span data-i18n=\"signup.teacher_type_1\"></span></h6><ul class=\"small m-t-1\"><li><span data-i18n=\"signup.teacher_type_2\"></span></li><li><span data-i18n=\"signup.teacher_type_3\"></span></li><li><span data-i18n=\"signup.teacher_type_4\"></span></li></ul></div><div class=\"card-footer\"><button class=\"btn btn-lg btn-navy teacher-path-button\"><div class=\"text-h6\"><span data-i18n=\"signup.signup_as_teacher\"></span></div></button></div></div><div class=\"path-card forest\"><div class=\"card-title\"><span data-i18n=\"courses.student\"></span></div><div class=\"card-content\"><h6 class=\"card-description\"><span data-i18n=\"signup.student_type_1\"></span></h6><ul class=\"small m-t-1\"><li><span data-i18n=\"signup.student_type_2\"></span></li><li><span data-i18n=\"signup.student_type_3\"></span></li><li><span data-i18n=\"signup.student_type_4\"></span></li></ul></div><div class=\"card-footer\"><i class=\"small\"><span data-i18n=\"signup.student_type_5\"></span></i><button class=\"btn btn-lg btn-forest student-path-button\"><div class=\"text-h6\"><span data-i18n=\"signup.signup_as_student\"></span></div></button></div></div></div><div class=\"individual-section\"><div class=\"individual-title\"><span data-i18n=\"signup.individuals_or_parents\"></span></div><p class=\"individual-description small\"><span data-i18n=\"signup.individual_type\"></span></p><button class=\"btn btn-lg btn-navy individual-path-button\"><div class=\"text-h6\"><span data-i18n=\"signup.signup_as_individual\"></span></div></button></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/core/create-account-modal/confirmation-view", function(exports, require, module) {
var __templateData = function anonymous(locals
/**/) {
var buf = [];
var locals_ = (locals || {}),view = locals_.view,me = locals_.me;buf.push("<div class=\"modal-body\"><div class=\"modal-body-content\"><h4 data-i18n=\"signup.account_created\" class=\"m-y-1\"></h4><div class=\"text-center m-y-1\">");
if ( view.signupState.get('path') === 'student')
{
buf.push("<p data-i18n=\"signup.confirm_student_blurb\"></p>");
}
else
{
buf.push("<p data-i18n=\"signup.confirm_individual_blurb\"></p>");
}
buf.push("</div><div class=\"signup-info-box-wrapper\"><div data-i18n=\"signup.write_this_down\" class=\"text-burgandy\"></div><div class=\"signup-info-box text-center\">");
if ( me.get('name'))
{
buf.push("<h4><b><span data-i18n=\"general.username\"></span>: " + (jade.escape((jade.interp = me.get('name')) == null ? '' : jade.interp)) + "</b></h4>");
}
if ( me.get('email'))
{
buf.push("<h5><b>");
var ssoUsed = view.signupState.get('ssoUsed');
if ( ssoUsed === 'facebook')
{
buf.push("<img src=\"/images/pages/modal/auth/facebook_small.png\" class=\"m-r-1\"/>" + (jade.escape(null == (jade.interp = me.get('email')) ? "" : jade.interp)));
}
else if ( ssoUsed === 'gplus')
{
buf.push("<img src=\"/images/pages/modal/auth/gplus_small.png\" class=\"m-r-1\"/>" + (jade.escape(null == (jade.interp = me.get('email')) ? "" : jade.interp)));
}
else
{
buf.push("<span data-i18n=\"general.email\"></span>: " + (jade.escape((jade.interp = me.get('email')) == null ? '' : jade.interp)) + "");
}
buf.push("</b></h5>");
}
buf.push("</div></div><button id=\"start-btn\" data-i18n=\"signup.start_playing\" class=\"btn btn-navy btn-lg m-t-3\"></button></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/core/create-account-modal/coppa-deny-view", function(exports, require, module) {
var __templateData = function anonymous(locals
/**/) {
var buf = [];
var locals_ = (locals || {}),view = locals_.view,state = locals_.state,translate = locals_.translate;buf.push("<form class=\"modal-body coppa-deny\"><div class=\"modal-body-content\"><div class=\"parent-email-input-group form-group\">");
if ( !view.state.get('parentEmailSent'))
{
buf.push("<label for=\"parent-email-input\" class=\"control-label text-h4\"><span data-i18n=\"signup.enter_parent_email\"></span></label><input" + (jade.attrs({ 'id':('parent-email-input'), 'type':("email"), 'name':("parentEmail"), 'value':(state.get('parentEmail')) }, {"type":true,"name":true,"value":true})) + "/>");
if ( state.get('error'))
{
buf.push("<p class=\"small error\"><span data-i18n=\"signup.parent_email_error\"></span></p>");
}
buf.push("<p class=\"small parent-email-blurb render\"><span>" + (null == (jade.interp = translate('signup.parent_email_blurb').replace('{{email_link}}', '<a href="mailto:team@codecombat.com">team@codecombat.com</a>')) ? "" : jade.interp) + "</span></p>");
}
if ( view.state.get('parentEmailSent'))
{
buf.push("<p class=\"small parent-email-blurb\"><span data-i18n=\"signup.parent_email_sent\"></span></p><a href=\"/play\" data-dismiss=\"modal\" class=\"btn btn-navy btn-lg\">Play without saving</a>");
}
buf.push("</div></div><!-- In reverse order for tabbing purposes--><div class=\"history-nav-buttons\"><button" + (jade.attrs({ 'type':('submit'), 'disabled':(state.get('parentEmailSent') || state.get('parentEmailSending')), "class": [('send-parent-email-button'),('btn'),('btn-lg'),('btn-navy')] }, {"type":true,"disabled":true})) + ">");
if ( state.get('parentEmailSent'))
{
buf.push("<span data-i18n=\"common.sent\"></span>");
}
else
{
buf.push("<span data-i18n=\"common.send\"></span>");
}
buf.push("</button><button type=\"button\" class=\"back-btn btn btn-lg btn-navy-alt\"><span data-i18n=\"common.back\"></span></button></div></form>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/core/create-account-modal/create-account-modal", function(exports, require, module) {
var __templateData = function anonymous(locals
/**/) {
var buf = [];
var locals_ = (locals || {}),view = locals_.view;var modal_footer_content_mixin = function(){
var block = this.block, attributes = this.attributes || {}, escaped = this.escaped || {};
if ( view.signupState.get('screen') !== 'confirmation')
{
buf.push("<div class=\"modal-footer-content\"><div class=\"small-details\"><span data-i18n=\"signup.login_switch\" class=\"spr\"></span><a class=\"login-link\"><span data-i18n=\"signup.sign_in\"></span></a></div></div>");
}
};
var modal_header_content_mixin = function(){
var block = this.block, attributes = this.attributes || {}, escaped = this.escaped || {};
buf.push("<h3>");
switch (view.signupState.get('path')){
case 'student':
buf.push("<span data-i18n=\"signup.create_student_header\"></span>");
  break;
case 'teacher':
buf.push("<span data-i18n=\"signup.create_teacher_header\"></span>");
  break;
case 'individual':
buf.push("<span data-i18n=\"signup.create_individual_header\"></span>");
  break;
default:
buf.push("<span data-i18n=\"login.sign_up\"></span>");
  break;
}
buf.push("</h3>");
};
buf.push("<div class=\"modal-dialog\"><div class=\"modal-content style-flat\"><div" + (jade.attrs({ "class": [('modal-header'),(view.signupState.get('path'))] }, {"class":true})) + "><span data-dismiss=\"modal\" aria-hidden=\"true\" class=\"glyphicon glyphicon-remove button close\"></span>");
modal_header_content_mixin();
buf.push("</div>");
switch (view.signupState.get('screen')){
case 'choose-account-type':
buf.push("<div id=\"choose-account-type-view\"></div>");
  break;
case 'segment-check':
buf.push("<div id=\"segment-check-view\"></div>");
  break;
case 'basic-info':
buf.push("<div id=\"basic-info-view\"></div>");
  break;
case 'coppa-deny':
buf.push("<div id=\"coppa-deny-view\"></div>");
  break;
case 'sso-already-exists':
buf.push("<div id=\"single-sign-on-already-exists-view\"></div>");
  break;
case 'sso-confirm':
buf.push("<div id=\"single-sign-on-confirm-view\"></div>");
  break;
case 'extras':
buf.push("<div id=\"extras-view\"></div>");
  break;
case 'confirmation':
buf.push("<div id=\"confirmation-view\"></div>");
  break;
}
buf.push("<div" + (jade.attrs({ "class": [('modal-footer'),(view.signupState.get('path'))] }, {"class":true})) + ">");
modal_footer_content_mixin();
buf.push("</div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/core/create-account-modal/extras-view", function(exports, require, module) {
var __templateData = function anonymous(locals
/**/) {
var buf = [];
buf.push("<div class=\"modal-body\"><div class=\"modal-body-content\"><div class=\"text-center\"><h4 data-i18n=\"signup.select_your_starting_hero\"></h4><div data-i18n=\"signup.you_can_always_change_your_hero_later\" class=\"small\"></div></div><div id=\"hero-select-view\"></div></div><!-- In reverse order for tabbing purposes--><div class=\"history-nav-buttons\"><button type=\"button\" class=\"next-button btn btn-lg btn-navy\"><span data-i18n=\"play.next\"></span></button></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/core/create-account-modal/segment-check-view", function(exports, require, module) {
var __templateData = function anonymous(locals
/**/) {
var buf = [];
var locals_ = (locals || {}),view = locals_.view,_ = locals_._,state = locals_.state;buf.push("<form class=\"modal-body segment-check\"><div class=\"modal-body-content\">");
switch (view.signupState.get('path')){
case 'student':
buf.push("<span data-i18n=\"signup.enter_class_code\"></span><div class=\"class-code-input-group form-group\"><input" + (jade.attrs({ 'name':("classCode"), 'value':(view.signupState.get('classCode')), "class": [('class-code-input')] }, {"name":true,"value":true})) + "/><div class=\"render\">");
if (!( _.isEmpty(view.signupState.get('classCode'))))
{
if ( state.get('classCodeValid'))
{
buf.push("<span class=\"glyphicon glyphicon-ok-circle class-code-valid-icon\"></span>");
}
else
{
buf.push("<span class=\"glyphicon glyphicon-remove-circle class-code-valid-icon\"></span>");
}
}
buf.push("</div></div><p class=\"render\">");
if ( _.isEmpty(view.signupState.get('classCode')))
{
buf.push("<span data-i18n=\"signup.ask_teacher_1\"></span>");
}
else if ( state.get('classCodeValid'))
{
buf.push("<span data-i18n=\"signup.about_to_join\" class=\"small\"></span><br/><span class=\"classroom-name\">" + (jade.escape(null == (jade.interp = view.classroom.get('name')) ? "" : jade.interp)) + "</span><br/><span class=\"teacher-name\">" + (jade.escape(null == (jade.interp = view.classroom.owner.get('name')) ? "" : jade.interp)) + "</span>");
}
else
{
buf.push("<span data-i18n=\"signup.classroom_not_found\"></span>");
}
if ( _.isEmpty(view.signupState.get('classCode')) || !state.get('classCodeValid'))
{
buf.push("<br/><span data-i18n=\"signup.ask_teacher_2\" class=\"spr\"></span><a class=\"individual-path-button\"><span data-i18n=\"signup.ask_teacher_3\"></span></a><span data-i18n=\"signup.ask_teacher_4\" class=\"spl\"></span>");
}
buf.push("</p>");
  break;
case 'teacher':
buf.push("<!-- TODO-->");
  break;
case 'individual':
buf.push("<div class=\"birthday-form-group form-group\"><span data-i18n=\"signup.enter_birthdate\"></span><div class=\"input-border\"><select id=\"birthday-month-input\" name=\"birthdayMonth\" style=\"width: 106px; float: left\" class=\"input-large form-control\"><option value=\"\" data-i18n=\"calendar.month\"></option>");
// iterate ['january','february','march','april','may','june','july','august','september','october','november','december']
;(function(){
  var $$obj = ['january','february','march','april','may','june','july','august','september','october','november','december'];
  if ('number' == typeof $$obj.length) {

    for (var index = 0, $$l = $$obj.length; index < $$l; index++) {
      var name = $$obj[index];

var month = index + 1
buf.push("<option" + (jade.attrs({ 'data-i18n':("calendar." + (name) + ""), 'value':(month), 'selected':((month == view.signupState.get('birthdayMonth'))) }, {"data-i18n":true,"value":true,"selected":true})) + "></option>");
    }

  } else {
    var $$l = 0;
    for (var index in $$obj) {
      $$l++;      var name = $$obj[index];

var month = index + 1
buf.push("<option" + (jade.attrs({ 'data-i18n':("calendar." + (name) + ""), 'value':(month), 'selected':((month == view.signupState.get('birthdayMonth'))) }, {"data-i18n":true,"value":true,"selected":true})) + "></option>");
    }

  }
}).call(this);

buf.push("</select><select id=\"birthday-day-input\" name=\"birthdayDay\" style=\"width: 75px; float: left\" class=\"input-large form-control\"><option value=\"\" data-i18n=\"calendar.day\"></option>");
// iterate _.range(1,32)
;(function(){
  var $$obj = _.range(1,32);
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var day = $$obj[$index];

buf.push("<option" + (jade.attrs({ 'selected':((day == view.signupState.get('birthdayDay'))) }, {"selected":true})) + ">" + (jade.escape((jade.interp = day) == null ? '' : jade.interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var day = $$obj[$index];

buf.push("<option" + (jade.attrs({ 'selected':((day == view.signupState.get('birthdayDay'))) }, {"selected":true})) + ">" + (jade.escape((jade.interp = day) == null ? '' : jade.interp)) + "</option>");
    }

  }
}).call(this);

buf.push("</select><select id=\"birthday-year-input\" name=\"birthdayYear\" style=\"width: 90px; float: left\" class=\"input-large form-control\"><option value=\"\" data-i18n=\"calendar.year\"></option>");
var thisYear = new Date().getFullYear()
// iterate _.range(thisYear, thisYear - 100, -1)
;(function(){
  var $$obj = _.range(thisYear, thisYear - 100, -1);
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var year = $$obj[$index];

buf.push("<option" + (jade.attrs({ 'selected':((year == view.signupState.get('birthdayYear'))) }, {"selected":true})) + ">" + (jade.escape((jade.interp = year) == null ? '' : jade.interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var year = $$obj[$index];

buf.push("<option" + (jade.attrs({ 'selected':((year == view.signupState.get('birthdayYear'))) }, {"selected":true})) + ">" + (jade.escape((jade.interp = year) == null ? '' : jade.interp)) + "</option>");
    }

  }
}).call(this);

buf.push("</select></div></div><div data-i18n=\"signup.parent_use_birthdate\" class=\"parent_birthdate\"></div>");
  break;
default:
buf.push("<p><span>Sign-up error, please contact </span>" + (jade.escape(null == (jade.interp = " ") ? "" : jade.interp)) + "<a href=\"mailto:support@codecombat.com\">support@codecombat.com</a>.</p>");
  break;
}
buf.push("</div><!-- In reverse order for tabbing purposes--><div class=\"history-nav-buttons\"><button type=\"submit\" class=\"next-button btn btn-lg btn-navy\"><span data-i18n=\"play.next\"></span></button><button type=\"button\" class=\"back-to-account-type btn btn-lg btn-navy-alt\"><span data-i18n=\"common.back\"></span></button></div></form>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/core/create-account-modal/single-sign-on-already-exists-view", function(exports, require, module) {
var __templateData = function anonymous(locals
/**/) {
var buf = [];
var locals_ = (locals || {}),view = locals_.view;buf.push("<div class=\"modal-body\"><div class=\"modal-body-content\">");
if ( view.signupState.get('ssoUsed'))
{
buf.push("<h4><span data-i18n=\"signup.account_exists\"></span></h4><div class=\"small\"><b><span>" + (jade.escape(null == (jade.interp = view.signupState.get('email')) ? "" : jade.interp)) + "</span></b></div><div class=\"hr-text\"><hr/><span data-i18n=\"common.continue\"></span></div><button class=\"login-link btn btn-lg btn-navy\"><span data-i18n=\"login.log_in\"></span></button>");
}
buf.push("</div><div class=\"history-nav-buttons just-one\"><button type=\"button\" class=\"back-button btn btn-lg btn-navy-alt\"><span data-i18n=\"common.back\"></span></button></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/core/create-account-modal/single-sign-on-confirm-view", function(exports, require, module) {
var __templateData = function anonymous(locals
/**/) {
var buf = [];
var locals_ = (locals || {}),view = locals_.view;buf.push("<form id=\"basic-info-form\" class=\"modal-body\"><div class=\"modal-body-content\"><h4><span data-i18n=\"signup.sso_connected\"></span></h4><div class=\"small m-y-1\">");
var ssoUsed = view.signupState.get('ssoUsed');
if ( ssoUsed === 'facebook')
{
buf.push("<img src=\"/images/pages/modal/auth/facebook_small.png\"/>");
}
if ( ssoUsed === 'gplus')
{
buf.push("<img src=\"/images/pages/modal/auth/gplus_small.png\"/>");
}
buf.push("<b class=\"m-x-1\"><span>" + (jade.escape(null == (jade.interp = view.signupState.get('email')) ? "" : jade.interp)) + "</span></b><span class=\"glyphicon glyphicon-ok-circle class-code-valid-icon\"></span></div><div class=\"hr-text m-y-3\"><hr/><span data-i18n=\"common.continue\"></span></div><div class=\"form-container\"><input" + (jade.attrs({ 'name':("email"), 'value':(view.signupState.get('email')), "class": [('hidden')] }, {"name":true,"value":true})) + "/><div class=\"form-group\"><div class=\"row\"><div class=\"col-xs-7 col-xs-offset-3\"><label for=\"username-input\" class=\"control-label\"><span data-i18n=\"general.username\"></span></label></div><div class=\"col-xs-5 col-xs-offset-3\"><input id=\"username-input\" name=\"name\" class=\"form-control input-lg\"/></div><div class=\"col-xs-4 name-check\">");
var checkNameState = view.state.get('checkNameState');
if ( checkNameState === 'checking')
{
buf.push("<span data-i18n=\"signup.checking\" class=\"small\"></span>");
}
if ( checkNameState === 'exists')
{
buf.push("<span class=\"small\"><span class=\"text-burgandy glyphicon glyphicon-remove-circle\"></span>" + (jade.escape(null == (jade.interp = " ") ? "" : jade.interp)) + "<span>" + (jade.escape(null == (jade.interp = view.state.get('suggestedNameText')) ? "" : jade.interp)) + "</span></span>");
}
if ( checkNameState === 'available')
{
buf.push("<span class=\"small\"><span class=\"text-forest glyphicon glyphicon-ok-circle\"></span>" + (jade.escape(null == (jade.interp = " ") ? "" : jade.interp)) + "<span data-i18n=\"signup.name_available\"></span></span>");
}
buf.push("</div></div></div><div class=\"form-group subscribe\"><div class=\"row\"><div class=\"col-xs-7 col-xs-offset-3\"><div class=\"checkbox\"><label><input id=\"subscribe-input\" type=\"checkbox\" checked=\"checked\" name=\"subscribe\"/><span data-i18n=\"signup.email_announcements\"></span></label></div></div></div></div></div></div><!-- In reverse order for tabbing purposes--><div class=\"history-nav-buttons\"><button type=\"submit\" class=\"next-button btn btn-lg btn-navy\"><span data-i18n=\"login.sign_up\"></span></button><button type=\"button\" class=\"back-button btn btn-lg btn-navy-alt\"><span data-i18n=\"common.back\"></span></button></div></form>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/core/diplomat-suggestion", function(exports, require, module) {
var __templateData = function anonymous(locals
/**/) {
var buf = [];
var locals_ = (locals || {}),view = locals_.view;buf.push("<div class=\"modal-dialog game\"><div class=\"background-wrapper\"><div class=\"modal-content\"><div class=\"modal-header\">");
if ( view.closeButton)
{
buf.push("<div type=\"button\" data-dismiss=\"modal\" aria-hidden=\"true\" class=\"button close\">&times;</div>");
}
buf.push("<h3 data-i18n=\"diplomat_suggestion.title\">Help translate CodeCombat!</h3></div><div class=\"modal-body\"><h4 data-i18n=\"diplomat_suggestion.sub_heading\">We need your language skills.</h4><p data-i18n=\"diplomat_suggestion.pitch_body\">We develop CodeCombat in English, but we already have players all over the world. Many of them want to play in {English} but don't speak English, so if you can speak both, please consider signing up to be a Diplomat and help translate both the CodeCombat website and all the levels into {English}.</p><p data-i18n=\"diplomat_suggestion.missing_translations\">Until we can translate everything into {English}, you'll see English when {English} isn't available.</p><p><a href=\"/contribute/diplomat\" data-i18n=\"diplomat_suggestion.learn_more\">Learn more about being a Diplomat</a></p></div><div class=\"modal-body wait secret\"><h3>Reticulating Splines...</h3><div class=\"progress progress-striped active\"><div class=\"progress-bar\"></div></div></div><div class=\"modal-footer\"><button id=\"subscribe-button\" data-i18n=\"diplomat_suggestion.subscribe_as_diplomat\" class=\"btn btn-primary btn-large\">Subscribe as a Diplomat</button></div></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/core/error", function(exports, require, module) {
var __templateData = function anonymous(locals
/**/) {
var buf = [];
var locals_ = (locals || {}),status = locals_.status,statusText = locals_.statusText,message = locals_.message;buf.push("<div id=\"modal-error\" class=\"modal fade\"><div class=\"modal-dialog\"><div class=\"modal-header\"><div type=\"button\" data-dismiss=\"modal\" aria-hidden=\"true\" class=\"button close\">&times;</div><h3>Error " + (jade.escape((jade.interp = status) == null ? '' : jade.interp)) + ": " + (jade.escape((jade.interp = statusText) == null ? '' : jade.interp)) + "</h3></div><div class=\"modal-body\"><p>" + (jade.escape((jade.interp = message) == null ? '' : jade.interp)) + "</p></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/core/hero-select-view", function(exports, require, module) {
var __templateData = function anonymous(locals
/**/) {
var buf = [];
var locals_ = (locals || {}),state = locals_.state,view = locals_.view;var heroOption_mixin = function(hero){
var block = this.block, attributes = this.attributes || {}, escaped = this.escaped || {};
var heroOriginal = hero.get('original')
var selectedState
if ( state.get('selectedHeroOriginal') === heroOriginal)
{
selectedState = 'selected'
}
else if ( view.options.showCurrentHero && state.get('currentHeroOriginal') === heroOriginal)
{
selectedState = 'current'
}
else
{
selectedState = ''
}
buf.push("<div" + (jade.attrs({ 'data-hero-original':(heroOriginal), "class": [('hero-option'),(selectedState)] }, {"class":true,"data-hero-original":true})) + "><div class=\"hero-avatar\"><img" + (jade.attrs({ 'src':(hero.getPortraitURL()) }, {"src":true})) + "/></div><div class=\"text-h5 hero-name\"><span>" + (jade.escape(null == (jade.interp = hero.getHeroShortName()) ? "" : jade.interp)) + "</span></div></div>");
};
buf.push("<div class=\"hero-list\">");
if ( view.heroes.loaded)
{
// iterate view.heroes.models
;(function(){
  var $$obj = view.heroes.models;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var hero = $$obj[$index];

if ( hero.get('heroClass') === 'Warrior')
{
heroOption_mixin(hero);
}
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var hero = $$obj[$index];

if ( hero.get('heroClass') === 'Warrior')
{
heroOption_mixin(hero);
}
    }

  }
}).call(this);

}
buf.push("</div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/core/loading-error", function(exports, require, module) {
var __templateData = function anonymous(locals
/**/) {
var buf = [];
var locals_ = (locals || {}),jqxhr = locals_.jqxhr,me = locals_.me,view = locals_.view;buf.push("<div id=\"loading-error\" class=\"text-center\">");
if ( !jqxhr)
{
buf.push("<h1 data-i18n=\"loading_error.unknown\"></h1>");
}
else if ( jqxhr.status === 401)
{
buf.push("<h1><span class=\"spr\">401:</span><span data-i18n=\"loading_error.login_required\"></span></h1><p data-i18n=\"loading_error.login_required_desc\"></p><button data-i18n=\"login.log_in\" class=\"login-btn btn btn-primary\"></button><button id=\"create-account-btn\" data-i18n=\"login.sign_up\" class=\"btn btn-primary\"></button><!-- 402 currently not in use. TODO: Set it up-->");
}
else if ( jqxhr.status === 402)
{
buf.push("<h2>402: Payment Required</h2>");
}
else if ( jqxhr.status === 403)
{
buf.push("<h1><span class=\"spr\">403:</span><span data-i18n=\"loading_error.forbidden\">Forbidden</span></h1><p data-i18n=\"loading_error.forbidden_desc\"></p><!-- this should make no diff... but sometimes the server returns 403 when it should return 401-->");
if ( !me.isAnonymous())
{
buf.push("<button id=\"logout-btn\" data-i18n=\"login.log_out\" class=\"btn btn-primary\"></button>");
}
}
else if ( jqxhr.status === 404)
{
buf.push("<h1><span class=\"spr\">404:</span><span data-i18n=\"loading_error.not_found\"></span></h1>");
var num = Math.floor(Math.random() * 3) + 1;
buf.push("<img" + (jade.attrs({ 'id':('not-found-img'), 'src':("/images/pages/not_found/404_" + (num) + ".png") }, {"src":true})) + "/><p data-i18n=\"loading_error.not_found_desc\"></p>");
}
else if ( !jqxhr.status)
{
buf.push("<h1 data-i18n=\"loading_error.connection_failure\"></h1><p data-i18n=\"loading_error.connection_failure_desc\"></p>");
}
else
{
if ( jqxhr.status === 408)
{
buf.push("<h1><span class=\"spr\">408:</span><span data-i18n=\"loading_error.timeout\"></span></h1>");
}
else if ( jqxhr.status >= 500 && jqxhr.status <= 599)
{
buf.push("<h1><span class=\"spr\">" + (jade.escape((jade.interp = jqxhr.status) == null ? '' : jade.interp)) + ":</span><span data-i18n=\"loading_error.server_error\"></span></h1>");
}
else
{
buf.push("<h1 data-i18n=\"loading_error.unknown\"></h1>");
}
buf.push("<p data-i18n=\"loading_error.general_desc\"></p>");
}
buf.push("<div id=\"links-row\" class=\"row\"><div class=\"col-sm-3\"><ul class=\"list-unstyled\"><li><strong data-i18n=\"common.help\"></strong></li><li><a href=\"/\" data-i18n=\"nav.home\"></a></li><li><a" + (jade.attrs({ 'href':(view.forumLink()), 'data-i18n':("nav.forum") }, {"href":true,"data-i18n":true})) + "></a></li><li><a tabindex=\"-1\" data-i18n=\"nav.contact\" class=\"contact-modal\"></a></li><li><a href=\"/community\" data-i18n=\"nav.community\"></a></li></ul></div><div class=\"col-sm-3\"><ul class=\"list-unstyled\"><li><strong data-i18n=\"courses.students\"></strong></li><li><a href=\"/students\" data-i18n=\"nav.learn_to_code\"></a></li>");
if ( me.isAnonymous())
{
buf.push("<li><a data-i18n=\"login.log_in\" class=\"login-btn\"></a></li>");
}
buf.push("<li><a href=\"/students\" data-i18n=\"courses.join_class\"></a></li></ul></div><div class=\"col-sm-3\"><ul class=\"list-unstyled\"><li><strong data-i18n=\"nav.teachers\"></strong></li><li><a href=\"/schools\" data-i18n=\"about.why_codecombat\"></a></li>");
if ( me.isAnonymous())
{
buf.push("<li><a data-i18n=\"login.log_in\" class=\"login-btn\"></a></li>");
}
buf.push("<li><a href=\"/teachers/classes\" data-i18n=\"nav.create_a_class\"></a></li></ul></div><div class=\"col-sm-3\"><ul class=\"list-unstyled\"><li><strong data-i18n=\"nav.other\"></strong></li><li><a href=\"http://blog.codecombat.com/\" data-i18n=\"nav.blog\"></a></li><li><a href=\"https://www.facebook.com/codecombat\" data-i18n=\"nav.facebook\"></a></li><li><a href=\"https://twitter.com/codecombat\" data-i18n=\"nav.twitter\"></a></li></ul></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/core/loading", function(exports, require, module) {
var __templateData = function anonymous(locals
/**/) {
var buf = [];
buf.push("<div class=\"loading-screen loading-container\"><h1 data-i18n=\"common.loading\">Loading...</h1><div class=\"progress\"><div class=\"progress-bar\"></div></div><div class=\"errors\"></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/core/modal-base-flat", function(exports, require, module) {
var __templateData = function anonymous(locals
/**/) {
var buf = [];
var locals_ = (locals || {}),view = locals_.view;buf.push("<div class=\"modal-dialog\"><div class=\"modal-content style-flat\"><div class=\"modal-header\">");
if ( view.closeButton)
{
buf.push("<div type=\"button\" data-dismiss=\"modal\" aria-hidden=\"true\" class=\"button close\">&times;</div>");
}
if ( view.options.headerContent)
{
buf.push("<h3>" + (null == (jade.interp = view.options.headerContent) ? "" : jade.interp) + "</h3>");
}
else
{
buf.push("<h3>man bites God</h3>");
}
buf.push("</div><div class=\"modal-body\">");
if ( view.options.bodyContent)
{
buf.push("<div>" + (null == (jade.interp = view.options.bodyContent) ? "" : jade.interp) + "</div>");
}
else
{
buf.push("<p>Man Bites God are the bad boys of the Melbourne live music and comedy scene. It is like being drowned in a bathtub of harmony.</p><img src=\"http://www.manbitesgod.com/images/picturecoupleb.jpg\"/><img src=\"http://www.manbitesgod.com/images/manrantb.jpg\"/>");
}
buf.push("</div><div class=\"modal-body wait secret\"><h3>Reticulating Splines...</h3><div class=\"progress progress-striped active\"><div class=\"progress-bar\"></div></div></div><div class=\"modal-footer\"><button type=\"button\" data-dismiss=\"modal\" aria-hidden=\"true\" data-i18n=\"modal.okay\" class=\"btn btn-primary\">Okay</button></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/core/modal-base", function(exports, require, module) {
var __templateData = function anonymous(locals
/**/) {
var buf = [];
var locals_ = (locals || {}),view = locals_.view;buf.push("<div class=\"modal-dialog game\"><div class=\"background-wrapper\"><div class=\"modal-content\"><div class=\"modal-header\">");
if ( view.closeButton)
{
buf.push("<div type=\"button\" data-dismiss=\"modal\" aria-hidden=\"true\" class=\"button close\">&times;</div>");
}
if ( view.options.headerContent)
{
buf.push("<h3>" + (null == (jade.interp = view.options.headerContent) ? "" : jade.interp) + "</h3>");
}
else
{
buf.push("<h3>man bites God</h3>");
}
buf.push("</div><div class=\"modal-body\">");
if ( view.options.bodyContent)
{
buf.push("<div>" + (null == (jade.interp = view.options.bodyContent) ? "" : jade.interp) + "</div>");
}
else
{
buf.push("<p>Man Bites God are the bad boys of the Melbourne live music and comedy scene. It is like being drowned in a bathtub of harmony.</p><img src=\"http://www.manbitesgod.com/images/picturecoupleb.jpg\"/><img src=\"http://www.manbitesgod.com/images/manrantb.jpg\"/>");
}
buf.push("</div><div class=\"modal-body wait secret\"><h3>Reticulating Splines...</h3><div class=\"progress progress-striped active\"><div class=\"progress-bar\"></div></div></div><div class=\"modal-footer\"><button type=\"button\" data-dismiss=\"modal\" aria-hidden=\"true\" data-i18n=\"modal.okay\" class=\"btn btn-primary\">Okay</button></div></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/core/not-found", function(exports, require, module) {
var __templateData = function anonymous(locals
/**/) {
var buf = [];
var locals_ = (locals || {}),view = locals_.view,me = locals_.me,usesSocialMedia = locals_.usesSocialMedia,isIE = locals_.isIE,fbRef = locals_.fbRef;buf.push("<div id=\"site-nav\"><a href=\"/\"><img id=\"nav-logo\" src=\"/images/pages/base/logo.png\" title=\"CodeCombat - Learn how to code by playing a game\" alt=\"CodeCombat\"/></a><div id=\"site-nav-links\"><a href=\"/\"><img id=\"small-nav-logo\" src=\"/images/pages/base/logo.png\" title=\"CodeCombat - Learn how to code by playing a game\" alt=\"CodeCombat\"/></a><a href=\"/\"><span class=\"glyphicon glyphicon-home\"></span></a><a href=\"/teachers\" data-i18n=\"nav.teachers\"></a><a href=\"/students\" data-i18n=\"nav.students\"></a><a" + (jade.attrs({ 'href':(view.forumLink()), 'data-i18n':("nav.forum") }, {"href":true,"data-i18n":true})) + "></a><a href=\"/community\" data-i18n=\"nav.community\"></a>");
if ( me.get('anonymous') === false)
{
buf.push("<span class=\"dropdown\"><button href=\"#\" data-toggle=\"dropdown\" class=\"btn btn-sm header-font dropdown-toggle\">");
if ( me.get('photoURL'))
{
buf.push("<img" + (jade.attrs({ 'src':(me.getPhotoURL(18)), 'alt':(""), "class": [('account-settings-image')] }, {"src":true,"alt":true})) + "/>");
}
else
{
buf.push("<i class=\"glyphicon glyphicon-user\"></i>");
}
buf.push("<span data-i18n=\"nav.account\" href=\"/account\" class=\"spl spr\"></span><span class=\"caret\"></span></button><ul role=\"menu\" class=\"dropdown-menu\"><li class=\"user-dropdown-header\"><span class=\"user-level\">" + (jade.escape(null == (jade.interp = me.level()) ? "" : jade.interp)) + "</span><a" + (jade.attrs({ 'href':("/user/" + (me.getSlugOrID()) + "") }, {"href":true})) + "><div" + (jade.attrs({ 'style':("background-image: url(" + (me.getPhotoURL()) + ")"), "class": [('img-circle')] }, {"style":true})) + "></div></a><h3>" + (jade.escape(null == (jade.interp = me.displayName()) ? "" : jade.interp)) + "</h3></li><li><a" + (jade.attrs({ 'href':("/user/" + (me.getSlugOrID()) + ""), 'data-i18n':("nav.profile") }, {"href":true,"data-i18n":true})) + "></a></li><li><a href=\"/account/settings\" data-i18n=\"play.settings\"></a></li>");
if (!( me.isStudent()))
{
buf.push("<li><a href=\"/account/payments\" data-i18n=\"account.payments\"></a></li>");
}
if ( me.hasSubscription() || !(me.isTeacher() || me.isStudent()))
{
buf.push("<li><a href=\"/account/subscription\" data-i18n=\"account.subscription\"></a></li>");
}
if (!( me.isStudent()))
{
buf.push("<li><a href=\"/account/prepaid\" data-i18n=\"account.prepaid_codes\"></a></li>");
}
buf.push("<li><a id=\"logout-button\" data-i18n=\"login.log_out\"></a></li></ul></span>");
}
else
{
buf.push("<button data-i18n=\"login.sign_up\" class=\"btn btn-sm btn-primary header-font signup-button\"></button><button data-i18n=\"login.log_in\" class=\"btn btn-sm btn-default header-font login-button\"></button>");
}
buf.push("<select class=\"language-dropdown form-control\"></select></div></div><div id=\"site-content-area\"><h1 data-i18n=\"not_found.page_not_found\" class=\"text-center\">Page Not Found</h1>");
var num = Math.floor(Math.random() * 3) + 1;
buf.push("<img" + (jade.attrs({ 'src':("/images/pages/not_found/404_" + (num) + ".png"), "class": [("not-found-image")] }, {"src":true,"class":true})) + "/></div><div class=\"achievement-corner\"></div><div id=\"site-footer\"><img id=\"footer-background\" src=\"/images/pages/base/nav_background.png\"/><div id=\"footer-links\"><a href=\"/about\" data-i18n=\"nav.about\"></a><a tabindex=\"-1\" data-i18n=\"nav.contact\" class=\"contact-modal\"></a><a href=\"http://blog.codecombat.com/\" data-i18n=\"nav.blog\"></a><a href=\"https://jobs.lever.co/codecombat\" tabindex=\"-1\" data-i18n=\"nav.careers\"></a><a href=\"/legal\" tabindex=\"-1\" data-i18n=\"nav.legal\"></a><a href=\"/privacy\" tabindex=\"-1\" data-i18n=\"legal.privacy_title\"></a><a href=\"/contribute\" tabindex=\"-1\" data-i18n=\"nav.contribute\"></a><a href=\"/play/ladder\" tabindex=\"-1\" data-i18n=\"game_menu.multiplayer_tab\"></a>");
if ( me.isAdmin())
{
buf.push("<a href=\"/admin\">Admin</a>");
}
if ( usesSocialMedia)
{
buf.push("<div class=\"share-buttons\">");
if ( !isIE)
{
buf.push("<div data-href=\"http://codecombat.com\" data-size=\"medium\" class=\"g-plusone\"></div>");
}
buf.push("<div" + (jade.attrs({ 'data-href':("https://www.facebook.com/codecombat"), 'data-send':("false"), 'data-layout':("button_count"), 'data-width':("350"), 'data-show-faces':("true"), 'data-ref':("coco_footer_" + (fbRef) + ""), "class": [('fb-like')] }, {"data-href":true,"data-send":true,"data-layout":true,"data-width":true,"data-show-faces":true,"data-ref":true})) + "></div>");
if ( !isIE)
{
buf.push("<a href=\"https://twitter.com/CodeCombat\" data-show-count=\"true\" data-show-screen-name=\"false\" data-dnt=\"true\" data-align=\"right\" data-i18n=\"nav.twitter_follow\" class=\"twitter-follow-button\"></a><iframe src=\"https://ghbtns.com/github-btn.html?user=codecombat&amp;repo=codecombat&amp;type=watch&amp;count=true\" allowtransparency=\"true\" frameborder=\"0\" scrolling=\"0\" width=\"110\" height=\"20\" class=\"github-star-button\"></iframe>");
}
buf.push("</div>");
}
buf.push("</div><div id=\"footer-credits\"><span><span>© All Rights Reserved</span><br/><span>CodeCombat 2015</span></span><img id=\"footer-logo\" src=\"/images/pages/base/logo.png\" alt=\"CodeCombat\"/><span><span>Site Design by</span><br/><a href=\"http://www.fullyillustrated.com/\">Fully Illustrated</a></span><!--a.firebase-bade(href=\"https://www.firebase.com/\")  // Not using right now--><!--  img(src=\"/images/pages/base/firebase.png\", alt=\"Powered by Firebase\")--></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/core/recover-modal", function(exports, require, module) {
var __templateData = function anonymous(locals
/**/) {
var buf = [];
var locals_ = (locals || {}),view = locals_.view;buf.push("<div class=\"modal-dialog game\"><div class=\"background-wrapper\"><div class=\"modal-content\"><div class=\"modal-header\">");
if ( view.closeButton)
{
buf.push("<div type=\"button\" data-dismiss=\"modal\" aria-hidden=\"true\" class=\"button close\">&times;</div>");
}
buf.push("<h3 data-i18n=\"recover.recover_account_title\">Recover Account</h3></div><div class=\"modal-body\"><div class=\"form\"><div class=\"form-group\"><label for=\"recover-email\" data-i18n=\"general.email\" class=\"control-label\">Email     </label><input id=\"recover-email\" name=\"email\" type=\"email\" class=\"input-large form-control\"/></div></div></div><div class=\"modal-body wait secret\"><h3 data-i18n=\"common.sending\">Sending...</h3><div class=\"progress progress-striped active\"><div class=\"progress-bar\"></div></div></div><div class=\"modal-footer\"><button id=\"recover-button\" data-i18n=\"recover.send_password\" class=\"btn btn-primary btn-large\">Send Recovery Password</button></div></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/core/subscribe-modal", function(exports, require, module) {
var __templateData = function anonymous(locals
/**/) {
var buf = [];
var locals_ = (locals || {}),view = locals_.view,me = locals_.me;buf.push("<div class=\"modal-dialog\"><div class=\"modal-content\">");
if ( view.state === 'purchasing')
{
buf.push("<div data-i18n=\"buy_gems.purchasing\" class=\"alert alert-info\"></div>");
}
else if ( view.state === 'retrying')
{
buf.push("<div id=\"retrying-alert\" data-i18n=\"buy_gems.retrying\" class=\"alert alert-danger\"></div>");
}
else
{
buf.push("<img id=\"subscribe-background\" src=\"/images/pages/play/modal/subscribe-background-blank.png\"/><img src=\"/images/pages/play/modal/subscribe-heroes.png\" class=\"subscribe-image\"/><h1 data-i18n=\"subscribe.subscribe_title\">Subscribe</h1><div id=\"close-modal\"><span class=\"glyphicon glyphicon-remove\"></span></div><div data-i18n=\"subscribe.comparison_blurb\" class=\"comparison-blurb\"></div><table class=\"table table-condensed table-bordered comparison-table\"><thead><tr><th></th>");
if ( !me.isOnPremiumServer())
{
buf.push("<th data-i18n=\"subscribe.free\" class=\"free-cell\"></th>");
}
buf.push("<th>");
if ( view.basicProduct)
{
buf.push("<span>$" + (jade.escape((jade.interp = (view.basicProduct.get('amount') / 100)) == null ? '' : jade.interp)) + "/</span><span data-i18n=\"subscribe.month\"></span>");
}
else
{
buf.push("<span>'...'</span>");
}
buf.push("</th></tr></thead><tbody><tr><td class=\"feature-description\"><span" + (jade.attrs({ 'data-i18n':("subscribe.feature1"), 'data-i18n-options':('{"levelsCount": ' + view.i18nData.levelsCount + ', "worldsCount": ' + view.i18nData.worldsCount + '}') }, {"data-i18n":true,"data-i18n-options":true})) + "></span></td>");
if ( !me.isOnPremiumServer())
{
buf.push("<td class=\"center-ok free-cell\"><span class=\"glyphicon glyphicon-ok\"></span></td>");
}
buf.push("<td class=\"center-ok\"><span class=\"glyphicon glyphicon-ok\"></span></td></tr><tr><td class=\"feature-description\"><span" + (jade.attrs({ 'data-i18n':("[html]subscribe.feature2"), 'data-i18n-options':('{"heroesCount": ' + view.i18nData.heroesCount + '}') }, {"data-i18n":true,"data-i18n-options":true})) + "></span></td>");
if ( !me.isOnPremiumServer())
{
buf.push("<td class=\"free-cell\"></td>");
}
buf.push("<td class=\"center-ok\"><span class=\"glyphicon glyphicon-ok\"></span></td></tr><tr><td class=\"feature-description\"><span" + (jade.attrs({ 'data-i18n':("subscribe.feature3"), 'data-i18n-options':('{"bonusLevelsCount": ' + view.i18nData.bonusLevelsCount + '}') }, {"data-i18n":true,"data-i18n-options":true})) + ">)</span></td>");
if ( !me.isOnPremiumServer())
{
buf.push("<td class=\"free-cell\"></td>");
}
buf.push("<td class=\"center-ok\"><span class=\"glyphicon glyphicon-ok\"></span></td></tr><tr><td class=\"feature-description gem-amount\"><span data-i18n=\"[html]subscribe.feature4\"></span></td>");
if ( !me.isOnPremiumServer())
{
buf.push("<td class=\"free-cell\"></td>");
}
buf.push("<td class=\"center-ok\"><span class=\"glyphicon glyphicon-ok\"></span></td></tr><tr><td class=\"feature-description\"><span data-i18n=\"[html]subscribe.feature7\"></span></td>");
if ( !me.isOnPremiumServer())
{
buf.push("<td class=\"free-cell\"></td>");
}
buf.push("<td class=\"center-ok\"><span class=\"glyphicon glyphicon-ok\"></span></td></tr><tr><td class=\"feature-description\"><span data-i18n=\"subscribe.feature6\"></span></td>");
if ( !me.isOnPremiumServer())
{
buf.push("<td class=\"free-cell\"></td>");
}
buf.push("<td class=\"center-ok\"><span class=\"glyphicon glyphicon-ok\"></span></td></tr>");
if ( me.getCampaignAdsGroup() === 'leaderboard-ads')
{
buf.push("<tr><td class=\"feature-description\"><span data-i18n=\"[html]subscribe.feature8\"></span></td>");
if ( !me.isOnPremiumServer())
{
buf.push("<td class=\"free-cell\"></td>");
}
buf.push("<td class=\"center-ok\"><span class=\"glyphicon glyphicon-ok\"></span></td></tr>");
}
buf.push("</tbody></table><div id=\"parents-info\" data-i18n=\"subscribe.parents\"></div><div id=\"payment-methods-info\" data-i18n=\"subscribe.payment_methods\"></div><div class=\"subscribe-actions\">");
if ( !me.isOnPremiumServer())
{
buf.push("<button data-i18n=\"subscribe.parent_button\" class=\"btn btn-lg btn-illustrated parent-button\"></button>");
}
if ( view.yearProduct)
{
buf.push("<button data-i18n=\"subscribe.sale_button\" class=\"btn btn-lg btn-illustrated sale-button\"></button>");
}
buf.push("<button data-i18n=\"subscribe.subscribe_title\" class=\"btn btn-lg btn-illustrated purchase-button\"></button></div>");
if ( view.state === 'declined')
{
buf.push("<div id=\"declined-alert\" class=\"alert alert-danger alert-dismissible\"><span data-i18n=\"buy_gems.declined\"></span><button type=\"button\" data-dismiss=\"alert\" class=\"close\"><span aria-hidden=\"true\">&times;</span></button></div>");
}
if ( view.state === 'unknown_error')
{
buf.push("<div id=\"error-alert\" class=\"alert alert-danger alert-dismissible\"><button type=\"button\" data-dismiss=\"alert\" class=\"close\"><span aria-hidden=\"true\">&times;</span></button><p data-i18n=\"loading_error.unknown\"></p><p>" + (jade.escape(null == (jade.interp = view.stateMessage) ? "" : jade.interp)) + "</p></div>");
}
}
buf.push("<div class=\"parent-button-popover-content hidden\"><div class=\"email-parent-form\"><p data-i18n=\"subscribe.parent_email_description\"></p><form><div class=\"form-group\"><label data-i18n=\"subscribe.parent_email_input_label\"></label><input type=\"email\" data-i18n=\"[placeholder]subscribe.parent_email_input_placeholder\" class=\"parent-input form-control\"/><div data-i18n=\"subscribe.parent_email_input_invalid\" class=\"parent-email-validator email_invalid\"></div></div><button type=\"submit\" data-i18n=\"subscribe.parent_email_send\" class=\"parent-send btn btn-default\"></button></form></div><div class=\"email-parent-complete\"><p data-i18n=\"subscribe.parent_email_sent\"></p><button type=\"button\" onclick=\"$('.parent-button').popover('hide');\" data-i18n=\"modal.close\" class=\"btn\"></button></div></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;
//# sourceMappingURL=/javascripts/app.js.map