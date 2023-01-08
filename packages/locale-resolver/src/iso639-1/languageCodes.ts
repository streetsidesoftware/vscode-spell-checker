type LangEntry = [
    /** lang or lang-locale (ISO-639-1) + (ISO-3166-1 alpha 2) */
    code: string,
    /** Name of the Language */
    language: string,
    /** Optional Country */
    country?: string
];
export const codes: LangEntry[] = [
    ['af', 'Afrikaans'],
    ['af-NA', 'Afrikaans', 'Namibia'],
    ['af-ZA', 'Afrikaans', 'South Africa'],
    ['ak', 'Akan'],
    ['ak-GH', 'Akan', 'Ghana'],
    ['am', 'Amharic'],
    ['am-ET', 'Amharic', 'Ethiopia'],
    ['ar', 'Arabic'],
    ['ar-1', 'Arabic'],
    ['ar-AE', 'Arabic', 'United Arab Emirates'],
    ['ar-BH', 'Arabic', 'Bahrain'],
    ['ar-DJ', 'Arabic', 'Djibouti'],
    ['ar-DZ', 'Arabic', 'Algeria'],
    ['ar-EG', 'Arabic', 'Egypt'],
    ['ar-EH', 'Arabic'],
    ['ar-ER', 'Arabic', 'Eritrea'],
    ['ar-IL', 'Arabic', 'Israel'],
    ['ar-IQ', 'Arabic', 'Iraq'],
    ['ar-JO', 'Arabic', 'Jordan'],
    ['ar-KM', 'Arabic', 'Comoros'],
    ['ar-KW', 'Arabic', 'Kuwait'],
    ['ar-LB', 'Arabic', 'Lebanon'],
    ['ar-LY', 'Arabic', 'Libya'],
    ['ar-MA', 'Arabic', 'Morocco'],
    ['ar-MR', 'Arabic', 'Mauritania'],
    ['ar-OM', 'Arabic', 'Oman'],
    ['ar-PS', 'Arabic'],
    ['ar-QA', 'Arabic', 'Qatar'],
    ['ar-SA', 'Arabic', 'Saudi Arabia'],
    ['ar-SD', 'Arabic', 'Sudan'],
    ['ar-SO', 'Arabic', 'Somalia'],
    ['ar-SS', 'Arabic'],
    ['ar-SY', 'Arabic', 'Syria'],
    ['ar-TD', 'Arabic', 'Chad'],
    ['ar-TN', 'Arabic', 'Tunisia'],
    ['ar-YE', 'Arabic', 'Yemen'],
    ['as', 'Assamese'],
    ['as-IN', 'Assamese', 'India'],
    ['az', 'Azerbaijani'],
    ['az-AZ', 'Azerbaijani', 'Azerbaijan'],
    ['be', 'Belarusian'],
    ['be-BY', 'Belarusian', 'Belarus'],
    ['bg', 'Bulgarian'],
    ['bg-BG', 'Bulgarian', 'Bulgaria'],
    ['bm', 'Bambara'],
    ['bm-ML', 'Bambara', 'Mali'],
    ['bn', 'Bengali'],
    ['bn-BD', 'Bengali', 'Bangladesh'],
    ['bn-IN', 'Bengali', 'India'],
    ['bo', 'Tibetan'],
    ['bo-CN', 'Tibetan', 'China'],
    ['bo-IN', 'Tibetan', 'India'],
    ['br', 'Breton'],
    ['br-FR', 'Breton', 'France'],
    ['bs', 'Bosnian'],
    ['bs-BA', 'Bosnian', 'Bosnia and Herzegovina'],
    ['ca', 'Catalan'],
    ['ca-AD', 'Catalan', 'Andorra'],
    ['ca-ES', 'Catalan', 'Spain'],
    ['ca-FR', 'Catalan', 'France'],
    ['ca-IT', 'Catalan', 'Italy'],
    ['ce', 'Chechen'],
    ['ce-RU', 'Chechen', 'Russia'],
    ['cs', 'Czech'],
    ['cs-CZ', 'Czech', 'Czech Republic'],
    ['cu', 'Old Slavonic'],
    ['cu-RU', 'Old Slavonic', 'Russia'],
    ['cy', 'Welsh'],
    ['cy-GB', 'Welsh', 'United Kingdom'],
    ['da', 'Danish'],
    ['da-DK', 'Danish', 'Denmark'],
    ['da-GL', 'Danish', 'Greenland'],
    ['de', 'German'],
    ['de-AT', 'German', 'Austria'],
    ['de-BE', 'German', 'Belgium'],
    ['de-CH', 'German', 'Switzerland'],
    ['de-DE', 'German', 'Germany'],
    ['de-IT', 'German', 'Italy'],
    ['de-LI', 'German', 'Liechtenstein'],
    ['de-LU', 'German', 'Luxembourg'],
    ['dz', 'Dzongkha'],
    ['dz-BT', 'Dzongkha', 'Bhutan'],
    ['ee', 'Ewe'],
    ['ee-GH', 'Ewe', 'Ghana'],
    ['ee-TG', 'Ewe', 'Togo'],
    ['el', 'Greek', 'Modern (1453-)'],
    ['el-CY', 'Greek', 'Cyprus'],
    ['el-GR', 'Greek', 'Greece'],
    ['en', 'English'],
    ['en-AG', 'English', 'Antigua and Barbuda'],
    ['en-AI', 'English', 'Anguilla'],
    ['en-AS', 'English', 'American Samoa'],
    ['en-AT', 'English', 'Austria'],
    ['en-AU', 'English', 'Australia'],
    ['en-BB', 'English', 'Barbados'],
    ['en-BE', 'English', 'Belgium'],
    ['en-BI', 'English', 'Burundi'],
    ['en-BM', 'English', 'Bermuda'],
    ['en-BS', 'English', 'Bahamas'],
    ['en-BW', 'English', 'Botswana'],
    ['en-BZ', 'English', 'Belize'],
    ['en-CA', 'English', 'Canada'],
    ['en-CC', 'English', 'Cocos (Keeling) Islands'],
    ['en-CH', 'English', 'Switzerland'],
    ['en-CK', 'English', 'Cook Islands'],
    ['en-CM', 'English', 'Cameroon'],
    ['en-CX', 'English', 'Christmas Island'],
    ['en-CY', 'English', 'Cyprus'],
    ['en-DE', 'English', 'Germany'],
    ['en-DG', 'English'],
    ['en-DK', 'English', 'Denmark'],
    ['en-DM', 'English', 'Dominica'],
    ['en-ER', 'English', 'Eritrea'],
    ['en-FI', 'English', 'Finland'],
    ['en-FJ', 'English', 'Fiji'],
    ['en-FK', 'English', 'Falkland Islands (Islas Malvinas)'],
    ['en-FM', 'English', 'Micronesia'],
    ['en-GB', 'English', 'United Kingdom'],
    ['en-GD', 'English', 'Grenada'],
    ['en-GG', 'English', 'Guernsey'],
    ['en-GH', 'English', 'Ghana'],
    ['en-GI', 'English', 'Gibraltar'],
    ['en-GM', 'English', 'Gambia'],
    ['en-GU', 'English', 'Guam'],
    ['en-GY', 'English', 'Guyana'],
    ['en-HK', 'English', 'Hong Kong'],
    ['en-IE', 'English', 'Ireland'],
    ['en-IL', 'English', 'Israel'],
    ['en-IM', 'English', 'Isle of Man'],
    ['en-IN', 'English', 'India'],
    ['en-IO', 'English', 'British Indian Ocean Territory'],
    ['en-JE', 'English', 'Jersey'],
    ['en-JM', 'English', 'Jamaica'],
    ['en-KE', 'English', 'Kenya'],
    ['en-KI', 'English', 'Kiribati'],
    ['en-KN', 'English', 'Saint Kitts and Nevis'],
    ['en-KY', 'English', 'Cayman Islands'],
    ['en-LC', 'English', 'Saint Lucia'],
    ['en-LR', 'English', 'Liberia'],
    ['en-LS', 'English', 'Lesotho'],
    ['en-MG', 'English', 'Madagascar'],
    ['en-MH', 'English', 'Marshall Islands'],
    ['en-MO', 'English', 'Macau'],
    ['en-MP', 'English', 'Northern Mariana Islands'],
    ['en-MS', 'English', 'Montserrat'],
    ['en-MT', 'English', 'Malta'],
    ['en-MU', 'English', 'Mauritius'],
    ['en-MW', 'English', 'Malawi'],
    ['en-MY', 'English', 'Malaysia'],
    ['en-NA', 'English', 'Namibia'],
    ['en-NF', 'English', 'Norfolk Island'],
    ['en-NG', 'English', 'Nigeria'],
    ['en-NL', 'English', 'Netherlands'],
    ['en-NR', 'English', 'Nauru'],
    ['en-NU', 'English', 'Niue'],
    ['en-NZ', 'English', 'New Zealand'],
    ['en-PG', 'English', 'Papua New Guinea'],
    ['en-PH', 'English', 'Philippines'],
    ['en-PK', 'English', 'Pakistan'],
    ['en-PN', 'English', 'Pitcairn Islands'],
    ['en-PR', 'English', 'Puerto Rico'],
    ['en-PW', 'English', 'Palau'],
    ['en-RW', 'English', 'Rwanda'],
    ['en-SB', 'English', 'Solomon Islands'],
    ['en-SC', 'English', 'Seychelles'],
    ['en-SD', 'English', 'Sudan'],
    ['en-SE', 'English', 'Sweden'],
    ['en-SG', 'English', 'Singapore'],
    ['en-SH', 'English', 'Saint Helena'],
    ['en-SI', 'English', 'Slovenia'],
    ['en-SL', 'English', 'Sierra Leone'],
    ['en-SS', 'English'],
    ['en-SX', 'English'],
    ['en-SZ', 'English', 'Swaziland'],
    ['en-TC', 'English', 'Turks and Caicos Islands'],
    ['en-TK', 'English', 'Tokelau'],
    ['en-TO', 'English', 'Tonga'],
    ['en-TT', 'English', 'Trinidad and Tobago'],
    ['en-TV', 'English', 'Tuvalu'],
    ['en-TZ', 'English', 'Tanzania'],
    ['en-UG', 'English', 'Uganda'],
    ['en-UM', 'English', 'Baker Island'],
    ['en-US', 'English', 'United States'],
    ['en-VC', 'English', 'Saint Vincent and the Grenadines'],
    ['en-VG', 'English', 'British Virgin Islands'],
    ['en-VI', 'English', 'U.S. Virgin Islands'],
    ['en-VU', 'English', 'Vanuatu'],
    ['en-WS', 'English', 'Samoa'],
    ['en-ZA', 'English', 'South Africa'],
    ['en-ZM', 'English', 'Zambia'],
    ['en-ZW', 'English', 'Zimbabwe'],
    ['eo', 'Esperanto'],
    ['es', 'Spanish'],
    ['es-AR', 'Spanish', 'Argentina'],
    ['es-BO', 'Spanish', 'Bolivia'],
    ['es-BR', 'Spanish', 'Brazil'],
    ['es-BZ', 'Spanish', 'Belize'],
    ['es-CL', 'Spanish', 'Chile'],
    ['es-CO', 'Spanish', 'Colombia'],
    ['es-CR', 'Spanish', 'Costa Rica'],
    ['es-CU', 'Spanish', 'Cuba'],
    ['es-DO', 'Spanish', 'Dominican Republic'],
    ['es-EA', 'Spanish'],
    ['es-EC', 'Spanish', 'Ecuador'],
    ['es-ES', 'Spanish', 'Spain'],
    ['es-GQ', 'Spanish', 'Equatorial Guinea'],
    ['es-GT', 'Spanish', 'Guatemala'],
    ['es-HN', 'Spanish', 'Honduras'],
    ['es-IC', 'Spanish'],
    ['es-MX', 'Spanish', 'Mexico'],
    ['es-NI', 'Spanish', 'Nicaragua'],
    ['es-PA', 'Spanish', 'Panama'],
    ['es-PE', 'Spanish', 'Peru'],
    ['es-PH', 'Spanish', 'Philippines'],
    ['es-PR', 'Spanish', 'Puerto Rico'],
    ['es-PY', 'Spanish', 'Paraguay'],
    ['es-SV', 'Spanish', 'El Salvador'],
    ['es-US', 'Spanish', 'United States'],
    ['es-UY', 'Spanish', 'Uruguay'],
    ['es-VE', 'Spanish', 'Venezuela'],
    ['et', 'Estonian'],
    ['et-EE', 'Estonian', 'Estonia'],
    ['eu', 'Basque'],
    ['eu-ES', 'Basque', 'Spain'],
    ['fa', 'Persian'],
    ['fa-AF', 'Persian', 'Afghanistan'],
    ['fa-IR', 'Persian', 'Iran'],
    ['ff', 'Fulah'],
    ['ff-CM', 'Fulah', 'Cameroon'],
    ['ff-GN', 'Fulah', 'Guinea'],
    ['ff-MR', 'Fulah', 'Mauritania'],
    ['ff-SN', 'Fulah', 'Senegal'],
    ['fi', 'Finnish'],
    ['fi-FI', 'Finnish', 'Finland'],
    ['fo', 'Faroese'],
    ['fo-DK', 'Faroese', 'Denmark'],
    ['fo-FO', 'Faroese', 'Faroe Islands'],
    ['fr', 'French'],
    ['fr-BE', 'French', 'Belgium'],
    ['fr-BF', 'French', 'Burkina Faso'],
    ['fr-BI', 'French', 'Burundi'],
    ['fr-BJ', 'French', 'Benin'],
    ['fr-BL', 'French'],
    ['fr-CA', 'French', 'Canada'],
    ['fr-CD', 'French', 'Congo'],
    ['fr-CF', 'French', 'Central African Republic'],
    ['fr-CG', 'French', 'Congo'],
    ['fr-CH', 'French', 'Switzerland'],
    ['fr-CI', "French, Cote d'Ivoire (Ivory Coast)"],
    ['fr-CM', 'French', 'Cameroon'],
    ['fr-DJ', 'French', 'Djibouti'],
    ['fr-DZ', 'French', 'Algeria'],
    ['fr-FR', 'French', 'France'],
    ['fr-GA', 'French', 'Gabon'],
    ['fr-GF', 'French', 'French Guiana'],
    ['fr-GN', 'French', 'Guinea'],
    ['fr-GP', 'French', 'Saint Barthelemy'],
    ['fr-GQ', 'French', 'Equatorial Guinea'],
    ['fr-HT', 'French', 'Haiti'],
    ['fr-KM', 'French', 'Comoros'],
    ['fr-LU', 'French', 'Luxembourg'],
    ['fr-MA', 'French', 'Morocco'],
    ['fr-MC', 'French', 'Monaco'],
    ['fr-MF', 'French'],
    ['fr-MG', 'French', 'Madagascar'],
    ['fr-ML', 'French', 'Mali'],
    ['fr-MQ', 'French', 'Martinique'],
    ['fr-MR', 'French', 'Mauritania'],
    ['fr-MU', 'French', 'Mauritius'],
    ['fr-NC', 'French', 'New Caledonia'],
    ['fr-NE', 'French', 'Niger'],
    ['fr-PF', 'French', 'French Polynesia'],
    ['fr-PM', 'French', 'Saint Pierre and Miquelon'],
    ['fr-RE', 'French', 'Reunion'],
    ['fr-RW', 'French', 'Rwanda'],
    ['fr-SC', 'French', 'Seychelles'],
    ['fr-SN', 'French', 'Senegal'],
    ['fr-SY', 'French', 'Syria'],
    ['fr-TD', 'French', 'Chad'],
    ['fr-TG', 'French', 'Togo'],
    ['fr-TN', 'French', 'Tunisia'],
    ['fr-VU', 'French', 'Vanuatu'],
    ['fr-WF', 'French', 'Wallis and Futuna'],
    ['fr-YT', 'French', 'Mayotte'],
    ['fy', 'Western Frisian'],
    ['fy-NL', 'Western Frisian', 'Netherlands'],
    ['ga', 'Irish'],
    ['ga-IE', 'Irish', 'Ireland'],
    ['gd', 'Gaelic'],
    ['gd-GB', 'Gaelic', 'United Kingdom'],
    ['gl', 'Galician'],
    ['gl-ES', 'Galician', 'Spain'],
    ['gu', 'Gujarati'],
    ['gu-IN', 'Gujarati', 'India'],
    ['gv', 'Manx'],
    ['gv-IM', 'Manx', 'Isle of Man'],
    ['ha', 'Hausa'],
    ['ha-GH', 'Hausa', 'Ghana'],
    ['ha-NE', 'Hausa', 'Niger'],
    ['ha-NG', 'Hausa', 'Nigeria'],
    ['he', 'Hebrew'],
    ['he-IL', 'Hebrew', 'Israel'],
    ['hi', 'Hindi'],
    ['hi-IN', 'Hindi', 'India'],
    ['hr', 'Croatian'],
    ['hr-BA', 'Croatian', 'Bosnia and Herzegovina'],
    ['hr-HR', 'Croatian', 'Croatia'],
    ['hu', 'Hungarian'],
    ['hu-HU', 'Hungarian', 'Hungary'],
    ['hy', 'Armenian'],
    ['hy-AM', 'Armenian', 'Armenia'],
    ['id', 'Indonesian'],
    ['id-ID', 'Indonesian', 'Indonesia'],
    ['ig', 'Igbo'],
    ['ig-NG', 'Igbo', 'Nigeria'],
    ['ii', 'Sichuan Yi'],
    ['ii-CN', 'Sichuan Yi', 'China'],
    ['is', 'Icelandic'],
    ['is-IS', 'Icelandic', 'Iceland'],
    ['it', 'Italian'],
    ['it-CH', 'Italian', 'Switzerland'],
    ['it-IT', 'Italian', 'Italy'],
    ['it-SM', 'Italian', 'San Marino'],
    ['it-VA', 'Italian', 'Vatican City'],
    ['ja', 'Japanese'],
    ['ja-JP', 'Japanese', 'Japan'],
    ['ka', 'Georgian'],
    ['ka-GE', 'Georgian', 'Georgia'],
    ['ki', 'Kikuyu'],
    ['ki-KE', 'Kikuyu', 'Kenya'],
    ['kk', 'Kazakh'],
    ['kk-KZ', 'Kazakh', 'Kazakhstan'],
    ['kl', 'Kalaallisut'],
    ['kl-GL', 'Kalaallisut', 'Greenland'],
    ['km', 'Central Khmer'],
    ['km-KH', 'Central Khmer', 'Cambodia'],
    ['kn', 'Kannada'],
    ['kn-IN', 'Kannada', 'India'],
    ['ko', 'Korean'],
    ['ko-KP', 'Korean', 'Korea'],
    ['ko-KR', 'Korean', 'Korea'],
    ['ks', 'Kashmiri'],
    ['ks-IN', 'Kashmiri', 'India'],
    ['kw', 'Cornish'],
    ['kw-GB', 'Cornish', 'United Kingdom'],
    ['ky', 'Kirghiz'],
    ['ky-KG', 'Kirghiz', 'Kyrgyzstan'],
    ['lb', 'Luxembourgish'],
    ['lb-LU', 'Luxembourgish', 'Luxembourg'],
    ['lg', 'Ganda'],
    ['lg-UG', 'Ganda', 'Uganda'],
    ['li', 'Limburgan'],
    ['ln', 'Lingala'],
    ['ln-AO', 'Lingala', 'Angola'],
    ['ln-CD', 'Lingala', 'Congo'],
    ['ln-CF', 'Lingala', 'Central African Republic'],
    ['ln-CG', 'Lingala', 'Congo'],
    ['lo', 'Lao'],
    ['lo-LA', 'Lao', 'Laos'],
    ['lorem', 'Lorem-Ipsum'], // This is a special place holder code
    ['lorem-ipsum', 'Lorem-Ipsum'], // This is a special place holder code
    ['lt', 'Lithuanian'],
    ['lt-LT', 'Lithuanian', 'Lithuania'],
    ['lu', 'Luba-Katanga'],
    ['lu-CD', 'Luba-Katanga', 'Congo'],
    ['lv', 'Latvian'],
    ['lv-LV', 'Latvian', 'Latvia'],
    ['mg', 'Malagasy'],
    ['mg-MG', 'Malagasy', 'Madagascar'],
    ['mk', 'Macedonian'],
    ['mk-MK', 'Macedonian', 'Macedonia'],
    ['ml', 'Malayalam'],
    ['ml-IN', 'Malayalam', 'India'],
    ['mn', 'Mongolian'],
    ['mn-MN', 'Mongolian', 'Mongolia'],
    ['mr', 'Marathi'],
    ['mr-IN', 'Marathi', 'India'],
    ['ms', 'Malay'],
    ['ms-BN', 'Malay', 'Brunei'],
    ['ms-MY', 'Malay', 'Malaysia'],
    ['ms-SG', 'Malay', 'Singapore'],
    ['mt', 'Maltese'],
    ['mt-MT', 'Maltese', 'Malta'],
    ['my', 'Burmese'],
    ['my-MM', 'Burmese', 'Myanmar (Burma)'],
    ['nb', 'Bokmål Norwegian'],
    ['nb-NO', 'Bokmål Norwegian', 'Norway'],
    ['nb-SJ', 'Bokmål Norwegian', 'Svalbard'],
    ['nd', 'Ndebele, North'],
    ['nd-ZW', 'Ndebele, North', 'Zimbabwe'],
    ['ne', 'Nepali'],
    ['ne-IN', 'Nepali', 'India'],
    ['ne-NP', 'Nepali', 'Nepal'],
    ['nl', 'Dutch'],
    ['nl-AW', 'Dutch', 'Aruba'],
    ['nl-BE', 'Dutch', 'Belgium'],
    ['nl-BQ', 'Dutch'],
    ['nl-CW', 'Dutch'],
    ['nl-NL', 'Dutch', 'Netherlands'],
    ['nl-SR', 'Dutch', 'Suriname'],
    ['nl-SX', 'Dutch'],
    ['nn', 'Norwegian Nynorsk'],
    ['nn-NO', 'Norwegian Nynorsk', 'Norway'],
    ['om', 'Oromo'],
    ['om-ET', 'Oromo', 'Ethiopia'],
    ['om-KE', 'Oromo', 'Kenya'],
    ['or', 'Oriya'],
    ['or-IN', 'Oriya', 'India'],
    ['os', 'Ossetian'],
    ['os-GE', 'Ossetian', 'Georgia'],
    ['os-RU', 'Ossetian', 'Russia'],
    ['pa', 'Panjabi'],
    ['pa-IN', 'Panjabi', 'India'],
    ['pa-PK', 'Panjabi', 'Pakistan'],
    ['pl', 'Polish'],
    ['pl-PL', 'Polish', 'Poland'],
    ['ps', 'Pushto'],
    ['ps-AF', 'Pushto', 'Afghanistan'],
    ['pt', 'Portuguese'],
    ['pt-AO', 'Portuguese', 'Angola'],
    ['pt-BR', 'Portuguese', 'Brazil'],
    ['pt-CH', 'Portuguese', 'Switzerland'],
    ['pt-CV', 'Portuguese', 'Cape Verde'],
    ['pt-GQ', 'Portuguese', 'Equatorial Guinea'],
    ['pt-GW', 'Portuguese', 'Guinea-Bissau'],
    ['pt-LU', 'Portuguese', 'Luxembourg'],
    ['pt-MO', 'Portuguese', 'Macau'],
    ['pt-MZ', 'Portuguese', 'Mozambique'],
    ['pt-PT', 'Portuguese', 'Portugal'],
    ['pt-ST', 'Portuguese', 'Sao Tome and Principe'],
    ['pt-TL', 'Portuguese', 'Timor-Leste (East Timor)'],
    ['qu', 'Quechua'],
    ['qu-BO', 'Quechua', 'Bolivia'],
    ['qu-EC', 'Quechua', 'Ecuador'],
    ['qu-PE', 'Quechua', 'Peru'],
    ['rm', 'Romansh'],
    ['rm-CH', 'Romansh', 'Switzerland'],
    ['rn', 'Rundi'],
    ['rn-BI', 'Rundi', 'Burundi'],
    ['ro', 'Romanian'],
    ['ro-MD', 'Romanian', 'Moldova'],
    ['ro-RO', 'Romanian', 'Romania'],
    ['ru', 'Russian'],
    ['ru-BY', 'Russian', 'Belarus'],
    ['ru-KG', 'Russian', 'Kyrgyzstan'],
    ['ru-KZ', 'Russian', 'Kazakhstan'],
    ['ru-MD', 'Russian', 'Moldova'],
    ['ru-RU', 'Russian', 'Russia'],
    ['ru-UA', 'Russian', 'Ukraine'],
    ['rw', 'Kinyarwanda'],
    ['rw-RW', 'Kinyarwanda', 'Rwanda'],
    ['se', 'Northern Sami'],
    ['se-FI', 'Northern Sami', 'Finland'],
    ['se-NO', 'Northern Sami', 'Norway'],
    ['se-SE', 'Northern Sami', 'Sweden'],
    ['sg', 'Sango'],
    ['sg-CF', 'Sango', 'Central African Republic'],
    ['si', 'Sinhala'],
    ['si-LK', 'Sinhala', 'Sri Lanka'],
    ['sk', 'Slovak'],
    ['sk-SK', 'Slovak', 'Slovakia'],
    ['sl', 'Slovenian'],
    ['sl-SI', 'Slovenian', 'Slovenia'],
    ['sn', 'Shona'],
    ['sn-ZW', 'Shona', 'Zimbabwe'],
    ['so', 'Somali'],
    ['so-DJ', 'Somali', 'Djibouti'],
    ['so-ET', 'Somali', 'Ethiopia'],
    ['so-KE', 'Somali', 'Kenya'],
    ['so-SO', 'Somali', 'Somalia'],
    ['sq', 'Albanian'],
    ['sq-AL', 'Albanian', 'Albania'],
    ['sq-MK', 'Albanian', 'Macedonia'],
    ['sq-XK', 'Albanian'],
    ['sr', 'Serbian'],
    ['sr-BA', 'Serbian', 'Bosnia and Herzegovina'],
    ['sr-ME', 'Serbian', 'Montenegro'],
    ['sr-RS', 'Serbian', 'Serbia'],
    ['sr-XK', 'Serbian'],
    ['sv', 'Swedish'],
    ['sv-AX', 'Swedish', 'Aland'],
    ['sv-FI', 'Swedish', 'Finland'],
    ['sv-SE', 'Swedish', 'Sweden'],
    ['sw', 'Swahili'],
    ['sw-CD', 'Swahili', 'Congo'],
    ['sw-KE', 'Swahili', 'Kenya'],
    ['sw-TZ', 'Swahili', 'Tanzania'],
    ['sw-UG', 'Swahili', 'Uganda'],
    ['ta', 'Tamil'],
    ['ta-IN', 'Tamil', 'India'],
    ['ta-LK', 'Tamil', 'Sri Lanka'],
    ['ta-MY', 'Tamil', 'Malaysia'],
    ['ta-SG', 'Tamil', 'Singapore'],
    ['te', 'Telugu'],
    ['te-IN', 'Telugu', 'India'],
    ['th', 'Thai'],
    ['th-TH', 'Thai', 'Thailand'],
    ['ti', 'Tigrinya'],
    ['ti-ER', 'Tigrinya', 'Eritrea'],
    ['ti-ET', 'Tigrinya', 'Ethiopia'],
    ['tk', 'Turkmen'],
    ['tk-TM', 'Turkmen', 'Turkmenistan'],
    ['to', 'Tonga (Tonga Islands)'],
    ['to-TO', 'Tonga (Tonga Islands)', 'Tonga'],
    ['tr', 'Turkish'],
    ['tr-CY', 'Turkish', 'Cyprus'],
    ['tr-TR', 'Turkish', 'Turkey'],
    ['ug', 'Uighur'],
    ['ug-CN', 'Uighur', 'China'],
    ['uk', 'Ukrainian'],
    ['uk-UA', 'Ukrainian', 'Ukraine'],
    ['ur', 'Urdu'],
    ['ur-IN', 'Urdu', 'India'],
    ['ur-PK', 'Urdu', 'Pakistan'],
    ['uz', 'Uzbek'],
    ['uz-AF', 'Uzbek', 'Afghanistan'],
    ['uz-UZ', 'Uzbek', 'Uzbekistan'],
    ['vi', 'Vietnamese'],
    ['vi-VN', 'Vietnamese', 'Vietnam'],
    ['vo', 'Volapük'],
    ['yi', 'Yiddish'],
    ['yi-1', 'Yiddish'],
    ['yo', 'Yoruba'],
    ['yo-BJ', 'Yoruba', 'Benin'],
    ['yo-NG', 'Yoruba', 'Nigeria'],
    ['zh', 'Chinese'],
    ['zh-CN', 'Chinese', 'China'],
    ['zh-HK', 'Chinese', 'Hong Kong'],
    ['zh-MO', 'Chinese', 'Macau'],
    ['zh-SG', 'Chinese', 'Singapore'],
    ['zh-TW', 'Chinese', 'China'],
    ['zu', 'Zulu'],
    ['zu-ZA', 'Zulu', 'South Africa'],
];
