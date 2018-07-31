function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    } else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

var psiNgrok = require('psi-ngrok');
module.exports = function(grunt) {

    var config = {
        adaptive: true,//флаг який не найшов свого використання, весь час тру
        localhost: 'http://localhost/pokraska/PACKER_INST/',//урл розміщення(використовується для зняття критичного css)
        absolute: 'webdone.info/',//урл абсолютний використовується в парсері ресурсів
        fonts: [{//список шрифтів і їх типів, робиться реплейс по файлам css для фіксу(зменшення) скачка текстів перед загрузкою шрифтів
            name: 'Akrobat',
            type: 'sans-serif'
        },
        {//список шрифтів і їх типів, робиться реплейс по файлам css для фіксу(зменшення) скачка текстів перед загрузкою шрифтів
            name: 'MuseoSansCyrl',
            type: 'sans-serif'
        }
        
        ],
        src: 'src/',//сорс папка
        dist: 'dist/',//дист папка
        includes: 'includes/',//папка по дефолту копійованих файлів(має в собі конфіг апача)
        pages_array: [{//ця частина не використовується взагалі, наразі включає основний файл для оптимізації
            file: 'index.html',
            host: ''
        }],
        ignore_scripts: ['document.write', 'yaCounter',"ga\\('",'gtag\\('],//список стрінгів для регулярок скриптів в втілі сторінки які не виносятсья в зовнішній файл
        imagemin_lvl: 0,//рівень мінмізації картинок
        base64max: 2048,//мінімальний розмір картинки, всі що менше перероблюються в бейс64
        lazy_load:false,//конфіг ввімкнення лейзілоад принципу на картинки
        page_n: 0,//не використовується
        css_n: 0,//не використовується
        injected_styles:'img{width:initial;height:initial}header :after,header :before,section :after,section :before,footer :after,footer :before{content:"";display:block;width:100%;height:0;clear:both;}'
        //вище стилі ксс які інєкцюються по дефолту, img{width:initial;height:initial} показав себе на декількох кастомних оптимізаціях
    }

    grunt.option("force", true);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            options: {
                force: true
            },
            dist: [config.dist + '**/*', config.dist],
            afterpack: [config.dist + 'crit/', config.dist + 'full.css', config.dist + 'crit.css'],
            cache: ['pack_cache/**/*', 'pack_cache/']
        },
        copy: {
            src_to_dist: {
                expand: true,
                flatten: false,
                cwd: config.src,
                src: '**/*.*',
                dest: config.dist,
            },
            includes: {
                expand: true,
                cwd: config.includes,
                src: ['.htaccess'],
                dest: config.dist
            },
        },
        cssmin: {
            options: {
                rebase: true,
                mergeIntoShorthands: false,
                keepSpecialComments: 0,
                compress: false,
                specialComments: 0,
                advanced: false,
                aggressiveMerging: false,
                level: 1,
                roundingPrecision: 2,
                noAdvanced: true,
                backgroundSizeMerging: false,
                skipProperties: ['background-size', 'background','background-position','background-repeat']
            },
            full_css: {
                files: {}
            },
            re_full_css: {
                options: {
                    level: 2,

                },
                files: [{
                    src: config.dist + 'crit.css',
                    dest: config.dist + 'crit.css'
                }]

            },
            full_f_fonts: {
                files: {}
            },
            all_cssmin: {

                files: [{
                    expand: true,
                    cwd: config.dist,
                    src: ['**/*.css'],
                    dest: config.dist,
                    ext: '.css'
                }]
            },
            critical: {
                files: [{
                    expand: true,
                    cwd: config.dist,
                    src: ['crit.css'],
                    dest: config.dist,
                    ext: '.css'
                }]
            }
        },
        comments: {
            your_target: {
                // Target-specific file lists and/or options go here. 
                options: {
                    singleline: true,
                    multiline: true,
                    keepSpecialComments: false
                },
                src: [config.dist + '**/*.css'] // files to remove comments from 
            },
        },

        uglify: {
            options: {
                compress: {
                    drop_console: true
                }
            },
            all_js: {
                files: [{
                    expand: true,
                    cwd: config.dist,
                    src: '**/*.js',
                    dest: config.dist
                }]
            },
        },

        imagemin: {
            all_images: {
                options: {
                    optimizationLevel: config.imagemin_lvl
                },
                files: [{
                    expand: true,
                    cwd: config.dist,
                    src: ['**/*.{png,jpg,gif}'],
                    dest: config.dist
                }]
            }
        },
        htmlmin: {
            options: {
                removeComments: true,
                collapseWhitespace: true,
                minifyJS: true,
                removeAttributeQuotes: false
            },
            all_html: {
                files: [{
                    expand: true,
                    cwd: config.dist,
                    src: ['**/*.{html,htm,php}'],
                    dest: config.dist
                }]

            }

        },

        dataUri: {},

        connect: {
            server: {
                options: {
                    port: 8000,
                    base: config.dist
                }
            }
        },
        'string-replace': {
            async_js: {}
        },

        autoprefixer: {
            options: {
                browsers: ['ie >= 8', 'last 10 versions', '> 0.1%', 'ff >= 20', 'Android > 1']
            },
            autoprefixer:{
                files:[]
            }
        },


        criticalcss: {
            options: {}
        },
        concat: {

            critical: {
                src: config.dist + 'crit/*.css',
                dest: config.dist + 'crit.css'
            }
        },
        insert: {
            options: {},
            main: {
                src: config.dist + 'crit.css',
                dest: config.dist + config.pages_array[0].file,
                match: "/*gf_head_css*/"
            },
        },
        guetzli: {
            files: {
                expand: true,
                src: config.dist+'*.jpg',
                dest: 'dist'
            },
            options: {
                quality: 95
            }
        },

        inlineImgSize: {},

    });
    grunt.loadNpmTasks('grunt-rebase');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-strip-css-comments');
    grunt.loadNpmTasks('grunt-stripcomments');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-data-uri');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-criticalcss');
    grunt.loadNpmTasks('grunt-insert');
    grunt.loadNpmTasks('grunt-inline-imgsize');
    grunt.loadNpmTasks('grunt-guetzli');


    grunt.registerTask('pagespeed', function() {
        var async = this.async;

        grunt.event.once('connect.server.listening', function(host, port) {

            var pages = [];
            for (var i = 0; i <= config.pages_array.length - 1; i++) {
                pages[pages.length] = config.pages_array[i].file;
            }

            psiNgrok({
                port: port,
                pages: pages,
                onError: function(error) {
                    grunt.fatal(error);
                },
                options: {
                    threshold: 95
                }
            }).then(async());
        });
    });

    grunt.registerTask('psi', ['pagespeed', 'connect:server:keepalive']);

    grunt.registerTask('html_validation_fixes', 'description', function() {

                var data = grunt.file.read(config.dist + 'index.html');

                var re_1 = /background-repeat:initial initial/g;
                var g1;
                do {
                    g1 = re_1.exec(data);
                    if (g1) {

                        data = data.replace(g1[0], 'background-repeat:initial');

                    }
                } while (g1);

                var re_2 = /background-position:initial initial/g;
                var g2;
                do {
                    g2 = re_2.exec(data);
                    if (g2) {

                        data = data.replace(g2[0], 'background-position:initial');

                    }
                } while (g2);


        grunt.file.write(config.dist + 'index.html', data);

    });

    grunt.registerTask('copy_manifest', 'description', function() {

        var data = grunt.file.read('optimized_contents/MANIFEST.txt');
        var k;
        var search;
        var re = /for (htt[^>]*?\/)\. The/g;
        var fonts = [];
        do {
            k = re.exec(data);
            if (k) {
                search = k[1];
            }
        } while (k);
        var re_search = new RegExp(search,'gi');

        data = data.replace(re_search,'');




        var task = grunt.config('copy');
        var run_array = [];
        var re2 = /(image\/([^>]*?)): (.*\/([\s\S]*?))\n/g;
        var re3 = /(css\/([^>]*?)): (.*\/([\s\S]*?))\n/g;
        var re4 = /(js\/([^>]*?)): (.*\/([\s\S]*?))\n/g;

        var k2,k3,k4;
        do {
            k2 = re2.exec(data);
            if (k2) {
                task['optim_' + run_array.length] = {
                    expand: true,
                    cwd: 'optimized_contents/image/',
                    src: [k2[1].replace('image/','')],
                    dest: 'optim/'+k2[3].replace(k2[4],'')
                }
                console.log('copy:optim_copy:optim_copy:optim_',task['optim_' + run_array.length]);
                run_array[run_array.length] = 'copy:optim_' + run_array.length;
            }
        } while (k2);

        do {
            k3 = re3.exec(data);
            if (k3) {
                task['optim_' + run_array.length] = {
                    expand: true,
                    cwd: 'optimized_contents/css/',
                    src: [k3[1].replace('css/','')],
                    dest: 'optim/'+k3[3].replace(k3[4],'')
                }
                console.log('copy:optim_copy:optim_copy:optim_',task['optim_' + run_array.length]);
                run_array[run_array.length] = 'copy:optim_' + run_array.length;
            }
        } while (k3);
        do {
            k4 = re4.exec(data);
            if (k4) {
                task['optim_' + run_array.length] = {
                    expand: true,
                    cwd: 'optimized_contents/js/',
                    src: [k4[1].replace('js/','')],
                    dest: 'optim/'+k4[3].replace(k4[4],'')
                }
                console.log('copy:optim_copy:optim_copy:optim_',task['optim_' + run_array.length]);
                run_array[run_array.length] = 'copy:optim_' + run_array.length;
            }
        } while (k4);
                task['optim_full'] = {
                    expand: true,
                    cwd: 'optim/',
                    src: ['**/*'],
                    dest: config.dist
                }
                run_array[run_array.length] = 'copy:optim_full';
        grunt.config('copy', task);
        grunt.task.run(run_array);
        


        


        // for (var i = 0; i <= config.pages_array.length - 1; i++) {



        // }

        // task = grunt.config('dataUri');
        // // console.log(task);

    });


    grunt.registerTask('parse_fonts', 'description', function() {

        var data = grunt.file.read(config.dist + 'css/fonts.css');
        var k;
        var re = /@font-face\s*\{[^}]+}/g;
        var fonts = [];
        do {
            k = re.exec(data);
            if (k) {
                fonts[fonts.length] = k[0];
            }
        } while (k);
        console.log(fonts);
        var new_data = ''
        for (var i = 0; i <= fonts.length - 1; i++) {
            new_data += fonts[i];
        }
        grunt.file.write(config.dist + 'css/fonts.css', new_data);

    });
    // grunt.loadNpmTasks('grunt-sass');
    // 
    // grunt.loadNpmTasks('grunt-contrib-watch');
    // grunt.loadNpmTasks('grunt-autoprefixer');
    // grunt.loadNpmTasks('grunt-ftpush');
    // grunt.loadNpmTasks('grunt-string-replace');
    // grunt.loadNpmTasks('grunt-contrib-clean');
    // grunt.loadNpmTasks('grunt-data-uri');
    // 
    // grunt.loadNpmTasks('grunt-w3c-html-validation');
    // grunt.loadNpmTasks('grunt-inline-imgsize');
    // grunt.loadNpmTasks('grunt-criticalcss');
    // grunt.loadNpmTasks('grunt-csscomb');
    // grunt.loadNpmTasks('grunt-htmlcomb');
    // grunt.loadNpmTasks('grunt-prettify');
    // grunt.loadNpmTasks("grunt-jsbeautifier");
    // grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.registerTask('rebase', ['rebase:scoped']);
    grunt.registerTask('css', ['cssmin', 'stripCssComments']);

    grunt.registerTask('inject_for_imgsize', 'description', function() {


        var task = grunt.config('inlineImgSize');
        for (var i = 0; i <= config.pages_array.length - 1; i++) {


            task['page' + i] = {
                files: {
                    src: [config.dist + config.pages_array[i].file]
                }
            };

        }

        // task = grunt.config('dataUri');
        // // console.log(task);
        grunt.config('inlineImgSize', task);

    });



    grunt.registerTask('pack_mid', 'description', function() {

        // grunt.task.run([
        //     'clean',
        //     'copy:src_to_dist',
        //     'copy:includes',
        //     'imagemin',
        //     //'dataUri',
        // ]);

        //наразі всього одна сторінка основна якої це стосується

        for (var i = 0; i <= config.pages_array.length - 1; i++) {
            var data = grunt.file.read(config.src + config.pages_array[i].file);
            var re_css = /<link.*(href)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g;
            var re_rel = /<link.*(rel)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g;
            //var re_js = /<script.*(src)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?.*?><\/script>/g;
            var re_js = /<script[^>](?![^>]*(async)).*(src)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?.*?><\/script>/g;
            //// console.log(data);
            var h, r, k, z;

            //паршення всіх зовнішніх скриптів, стилів, формування конфігу для асинхронного завантаження сторінки

            config.links = ['css/fonts.css'];
            var scripts = [];
            var doc_scripts = [];

            //stylesheet links & scripts
            do {
                h = re_css.exec(data);
                r = re_rel.exec(data);
                if (h && r) {
                    if (r[2] == "stylesheet") {
                        config.links[config.links.length] = h[2]; //набирання стилів
                    }

                }
            } while (h);

            do {
                k = re_js.exec(data);
                if (k) {
                    scripts[scripts.length] = k[3];//набирання скриптів
                }
            } while (k);


            //document js parsing 
            //парсить JS в тілі сторінки, не беручи ігноровані

            data = grunt.file.read(config.dist + config.pages_array[i].file);
            var re_doc_js = /<script\b[^>]*>([\s\S]*?)<\/script>/g;
            do {
                z = re_doc_js.exec(data);
                if (z) {
                    var valid = true;
                    for (var j = config.ignore_scripts.length - 1; j >= 0; j--) {
                        if (z[1].indexOf(config.ignore_scripts[j]) > -1) {
                            valid = false;
                        }
                    }
                    if (z[1].length < 4) {
                        valid = false;
                    }
                    if (valid) {
                        doc_scripts[doc_scripts.length] = z[1];
                    }
                }
            } while (z);

            var doc_script_data = '';
            // var task_s = grunt.config('string-replace');

            //     task_s['script_page_' + i] = {
            //         files: {},
            //         options: {replacements: []}
            //     };
            //     task_s['script_page_' + i].files['./'+config.dist] = config.pages_array[i].file;
            var regexp_string = '<script(?![^>]*async)[^>]*>((?![^>]*(';
            for (var l = 0; l <= config.ignore_scripts.length - 1; l++) {
                regexp_string += config.ignore_scripts[l] + '|';

            }
            regexp_string = regexp_string.slice(0, -1);
            regexp_string += ')[^>]*)[\\s\\S]*?)<\/script>';
            console.log('regexp_string = ', regexp_string)
            var re = new RegExp(regexp_string, "ig");
            console.log('regexp_string = ', regexp_string, re);
            //     // console.log('REEEEEEE + ',re);
            // task_s['script_page_' + i].options.replacements[j] = {
            //         pattern:re,
            //         replacement: ''
            //     };
            // // 
            // // // console.log(task_s);
            // grunt.config('string-replace', task_s);
        

            data = data.replace(re, '');
            //вилучення зі сторінки паршеного js коду



            for (var j = 0; j <= doc_scripts.length - 1; j++) {
                doc_script_data += doc_scripts[j] + ';';
                // // console.log(data,doc_scripts[j]);
                // var re = new RegExp(doc_scripts[j], "ig");
                // data = data.replace(re,'');
                // task_s['script_page_' + i].options.replacements[j] = {
                //     pattern:/<script[^>]*>((?![^>]*resize|metrics|wow[^>]*)[\s\S]*?)<\/script>/gi,
                //     replacement: ''
                // };
                // // task = grunt.config('dataUri');
                // // console.log(re);
            }
            scripts[scripts.length] = 'js/doc_js.js';//добавляння js файлу контент якого = спаршеним скриптам в тілі сторінки
            // console.log(doc_scripts, doc_script_data, doc_scripts.length);



            //local css links
            var local_links = [];

            for (var j = 0; j <= config.links.length - 1; j++) {
                if (config.links[j].indexOf('//') > -1 && config.links[j].indexOf(extractHostname(config.absolute)) > -1 ||
                    config.links[j].indexOf('//') > -1 && config.links[j].indexOf(extractHostname(config.localhost)) > -1 ||
                    config.links[j].indexOf('//') == -1) {

                    if (config.links[j].indexOf('//') > -1 && config.links[j].indexOf(extractHostname(config.absolute)) > -1) {
                        local_links[local_links.length] = config.links[j].split(config.absolute)[1];
                    } else if (config.links[j].indexOf('//') > -1 && config.links[j].indexOf(extractHostname(config.localhost)) > -1) {

                        local_links[local_links.length] = config.links[j].split(config.localhost)[1];
                    } else if (config.links[j].indexOf('//') == -1) {

                        if (config.links[j].indexOf('./') > -1) {

                            local_links[local_links.length] = config.links[j].split('./')[1];
                        } else {

                            local_links[local_links.length] = config.links[j];
                        }

                    }

                }
            }

            console.log('local_links = ', local_links)


            //формування списку файлів стилів для автопрефіксу і вилученні з них шрифтів, а також фіксів типів шрифтів
            var font_fix_liks = [];
            for (var h = 0; h <= local_links.length - 1; h++) {
                if (h >= 1) {
                    font_fix_liks[h - 1] = config.dist + local_links[h]
                }
            }

            //autoprefixer
            //
            var a_task = grunt.config('autoprefixer');
            // a_task['autoprefixer'] = {
            //     files: []
            // };
            for (var j = 0; j <= font_fix_liks.length - 1; j++) {

                a_task.autoprefixer.files[j] = {};
                a_task.autoprefixer.files[j][font_fix_liks[j]] = font_fix_liks[j]
                    // task = grunt.config('dataUri');
            }
            console.log('autoprefixer_config', a_task['autoprefixer'].files);
            grunt.config('autoprefixer', a_task);

            //datauri to loacl css
            var task = grunt.config('dataUri');
            for (var j = 0; j <= local_links.length - 1; j++) {


                var re = /(.*\/).*.css/g;
                var h = re.exec(local_links[j]);
                task['base' + j] = {
                    src: [],
                    dest: '',
                    options: {
                        target: [config.dist + '**/*.{png,jpg,gif}'],
                        fixDirLevel: true,
                        maxBytes: config.base64max

                    }
                };
                task['base' + j].src = [config.dist + local_links[j]];
                if (h) {

                    task['base' + j].dest = config.dist + h[1];
                } else {

                    task['base' + j].dest = config.dist;
                }
                // task = grunt.config('dataUri');
                // // console.log(task);
            }
            grunt.config('dataUri', task);
            console.log('dataUri_config', task);

            if (config.lazy_load == true) {
                //lazy_load
                var source_strings = [];
                var re_img = /<img[^>]*( src=("|'|)(.*?(svg|png|jpg|gif))("|'|))/g;
                var g;
                do {
                    g = re_img.exec(data);
                    if (g) {
                        source_strings[source_strings.length] = {
                            full: g[1],
                            src: g[3]
                        }
                        console.log(source_strings[source_strings.length]);

                        data = data.replace(g[1], ' src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-src="' + g[3] + '"')

                    }
                } while (g);
                
                console.log('lazy_load replaces');
                    
                
                //doc_script_data += '$(document).ready(function() {$("img").each(function(){$(this).attr("data-src")&&$(this).attr("src",$(this).attr("data-src"))});});';
                doc_script_data += '!function(e){function t(e,t){var n=new Image,r=e.getAttribute("data-src");n.onload=function(){e.parent?e.parent.replaceChild(n,e):e.src=r,t?t():null},n.src=r}function n(t){var n=t.getBoundingClientRect();return n.top>=0&&n.left>=0&&n.top<=(e.innerHeight||document.documentElement.clientHeight)}for(var r=function(e,t){if(document.querySelectorAll)t=document.querySelectorAll(e);else{var n=document,r=n.styleSheets[0]||n.createStyleSheet();r.addRule(e,"f:b");for(var l=n.all,c=0,o=[],i=l.length;i>c;c++)l[c].currentStyle.f&&o.push(l[c]);r.removeRule(0),t=o}return t},l=function(t,n){e.addEventListener?this.addEventListener(t,n,!1):e.attachEvent?this.attachEvent("on"+t,n):this["on"+t]=n},c=new Array,o=r("img"),i=function(){for(var e=0;e<c.length;e++)n(c[e])&&t(c[e],function(){c.splice(e,e)})},u=0;u<o.length;u++)c.push(o[u]);i(),l("scroll",i)}(this);';


            }
            //fonts_fix

            var task_sr = grunt.config('string-replace');
            var replacements = [{
                pattern: /@font-face\s*\{[^}]+}/g,
                replacement: ''
            }];

            for (var u = 0; u <= config.fonts.length - 1; u++) {
                // replacements[(u+1)*3-3] = {
                //     pattern: new RegExp(config.fonts[u].name,'gi'),
                //     replacement: '"'+config.fonts[u].name+'",'+config.fonts[u].type
                // }
                // replacements[(u+1)*3-2] = {
                //     pattern: new RegExp('"'+config.fonts[u].name+'"','gi'),
                //     replacement: '"'+config.fonts[u].name+'",'+config.fonts[u].type
                // }
                // replacements[(u+1)*3-1] = {
                //     pattern: new RegExp("'"+config.fonts[u].name+"'",'gi'),
                //     replacement: '"'+config.fonts[u].name+'",'+config.fonts[u].type
                // }
                replacements[replacements.length] = {
                    pattern: new RegExp('(\'|")' + config.fonts[u].name + '(\'|")', 'gi'),
                    replacement: '"' + config.fonts[u].name + '",' + config.fonts[u].type
                }
            }
            // console.log('task_srtask_srtask_srtask_sr',replacements);
            task_sr.fonts_fix = {
                files: {
                    './': font_fix_liks
                },
                options: {
                    replacements: replacements
                }
            };


            grunt.config('string-replace', task_sr);
            // var re = /.*\//g;
            // var h = re.exec(config.pages_array[i].file);
            // var dest = config.dist;
            // if (h) {
            //     dest = config.dist + h[1]
            // }
            // var task = grunt.config('dataUri');
            // task['base' + local_links.length] = {
            //     src: [],
            //     dest: '',
            //     options: {
            //         target: [config.dist + '**/*.{png,jpg,gif}'],
            //         fixDirLevel: false,
            //         maxBytes: config.base64max

            //     }
            // };



            // task['base' + j].src = [config.dist + config.pages_array[i].file];
            // task['base' + j].dest = dest;

            // grunt.config('dataUri', task);

            data = data.replace(/<\/head>/gi, '<style>' + config.injected_styles + '</style></head>');

            data = data.replace(/<\/head>/gi, '<style>/*gf_head_css*/</style></head>');


            //async_js
            var async_js = '<script>!function(e,t,n){function r(){for(;u[0]&&"loaded"==u[0][l];)o=u.shift(),o[f]=!a.parentNode.insertBefore(o,a)}for(var i,s,o,u=[],a=e.scripts[0],f="onreadystatechange",l="readyState";i=n.shift();)s=e.createElement(t),"async"in a?(s.async=!1,e.head.appendChild(s)):a[l]?(u.push(s),s[f]=r):e.write("<"+t+\' src="\'+i+\'" defer></\'+t+">"),s.src=i}(document,"script",[';
            for (var j = 0; j <= scripts.length - 1; j++) {
                async_js += '"' + scripts[j] + '",';
            }
            async_js = async_js.slice(0, -1);
            async_js += '])</script></body>';


            data = data.replace(/<\/body>/gi, async_js);

            //async_css
            var async_css = '<script>!function(e){for(var t=document.getElementsByTagName("head")[0],s=0;s<e.length;s++){var a=document.createElement("link"),l=document.createAttribute("rel"),n=document.createAttribute("href");l.value="stylesheet",n.value=e[s],a.setAttributeNode(l),a.setAttributeNode(n),t.appendChild(a)}}([';
            for (var j = 0; j <= config.links.length - 1; j++) {
                async_css += '"' + config.links[j] + '",';
            }
            async_css = async_css.slice(0, -1);
            async_css += '])</script></body>';
            data = data.replace(/\<link[\s\S]*?[stylesheet][\s\S]*?\>/gi, '');
            data = data.replace(/<\/body>/gi, async_css);

            
            grunt.file.write(config.dist + config.pages_array[i].file, data);

            grunt.file.write(config.dist + 'js/doc_js.js', doc_script_data);

            //full_css

            var f_task = grunt.config('cssmin');
            f_task.full_css.files[config.dist + 'full.css'] = [];
            f_task.full_f_fonts.files[config.dist + 'css/fonts.css'] = [];
            //f_task.re_full_css.files[config.dist +'crit.css'] = [config.dist +'crit.css'];

            for (var j = 0; j <= local_links.length - 1; j++) {
                f_task.full_css.files[config.dist + 'full.css'][j] = config.dist + local_links[j]
                f_task.full_f_fonts.files[config.dist + 'css/fonts.css'][j] = config.dist + local_links[j]
                    // task = grunt.config('dataUri');
                // console.log('>>>>>>>>>>>', f_task);
            }
            console.log('>>>>>>>>>>>', f_task.full_css.files);
            grunt.config('cssmin', f_task);


            //critical css
            var cc_task = grunt.config('criticalcss');
            cc_task['full_' + i] = {
                options: {
                    url: config.localhost + config.src + config.pages_array[i].host,
                    outputfile: config.dist + "crit/critical.css",
                    filename: config.dist + "full.css",
                    ignoreConsole: true,
                    width: 1200,
                    height: 900,
                    buffer: 1000000 * 1024
                }
            };
            cc_task['full_tab_' + i] = {
                options: {
                    url: config.localhost + config.src + config.pages_array[i].host,
                    outputfile: config.dist + "crit/critical_t_h.css",
                    filename: config.dist + "full.css",
                    ignoreConsole: true,
                    width: 1024,
                    height: 768,
                    buffer: 1000000 * 1024
                }
            };
            cc_task['tablet_' + i] = {
                options: {
                    url: config.localhost + config.src + config.pages_array[i].host,
                    outputfile: config.dist + "crit/critical_t_v.css",
                    filename: config.dist + "full.css",
                    ignoreConsole: true,
                    width: 768,
                    height: 1024,
                    buffer: 1000000 * 1024
                }
            };
            cc_task['full_height_mobile' + i] = {
                options: {
                    url: config.localhost + config.src + config.pages_array[i].host,
                    outputfile: config.dist + "crit/critical_f_m.css",
                    filename: config.dist + "full.css",
                    ignoreConsole: true,
                    width: 340,
                    height: 1024,
                    buffer: 1000000 * 1024
                }
            };
            cc_task['mobile_' + i] = {
                options: {
                    url: config.localhost + config.src + config.pages_array[i].host,
                    outputfile: config.dist + "crit/critical_m.css",
                    filename: config.dist + "full.css",
                    ignoreConsole: true,
                    width: 320,
                    height: 540,
                    buffer: 1000000 * 1024
                }
            };
            // task = grunt.config('dataUri');

            // console.log(cc_task);
            grunt.config('criticalcss', cc_task);

            // var task = grunt.config('string-replace');

            //     task.async_js = {
            //         files: {},
            //         options: {replacements: []}
            //     };
            //     task.async_js.files['./'+config.dist] = config.pages_array[i].file;
            // task.async_js.options.replacements[j] = {
            //         pattern:/<\/head>/gi,
            //         replacement: async_js
            //     };


            // grunt.config('string-replace', task);

            // grunt.task.run([]);

            // for (var i = config.links.length - 1; i >= 0; i--) {
            //     var task = grunt.config('stripCssComments');
            //     task.full_css.files[config.links[i]] = config.links[i];

            //     grunt.config('stripCssComments', task);

            //     // console.log(task);
            //     grunt.task.run(['stripCssComments']);
            // }
            // console.log(local_links);
            // console.log(config.links);
            // console.log(scripts);
        }


    });
    grunt.registerTask('pack', [
        'clean',                    //очистка дист
        'copy:src_to_dist',         //копіювання сорсу в діст
        'copy:includes',            //копіювання інклудів(конфіг апача)
        'imagemin',                 //стискання картинок 1
        'guetzli',                  //стискання картинок 2
        'inject_for_imgsize',       //створення конфігу для модуля добавляння розмірів зображень <img
        'inlineImgSize',            //наразі переводить добавляє на зображення <img розміри тільки на основній сторінці
        'htmlmin',                  //стискання html всюди по dist/
        'pack_mid',                 //організація асинхронного завантаження сорсів, парсинг скриптів, парсинг шрифтів,підготовка файлів(НАЙЦІКАВІША ЧАСТИНА)
        'cssmin:full_f_fonts',      //запис всього ксс в файл з шрифтами
        'parse_fonts',              //репарс шрифтів - вилучення всього іншого
        'string-replace',           //фікс типів шрифтів а також вилучення оголошення шрифтів з інших ксс файлів
        'comments',                 //вилучення коментарів з css файлів
        'autoprefixer',             //автопрефіксер всіх css
        'dataUri',                  //перевід сорсів в css в data-uri
        'cssmin:all_cssmin',        //мініфікація всього ксс
        'cssmin:full_css',          //збирання всього ксс в один файл
        'criticalcss',              //виділення по юрлу і фул ксс критичного для всіх версій
        'concat:critical',          //склейка всіх версій критичного ксс в один
        'cssmin:critical',          //мініфікація критичного css
        'cssmin:re_full_css',       //повторна мініфікація критичного(хз нащо)
        'insert',                   //вставка критичного в тіло сайтоу
        'uglify',                   //стискання js
        'clean:afterpack',          //очистка временних файлів
        'html_validation_fixes',    //стринг реплейс для фіксу валідатора(чомусь стискання ксс інколи не валідне для html валідатора)
        'psi'   
    ]);
    grunt.task.run(['dataUri']);
    grunt.task.run([]);

    grunt.registerTask('css_manipulations', 'description', function() {
        // var task = grunt.config('task');

        // task.src = doSearch(...);

        // grunt.config('task', task);

        // grunt.task.run(['task']);
    });

    //var async_init = '</style><script>!function(e,t,n){function r(){for(;u[0]&&"loaded"==u[0][l];)o=u.shift(),o[f]=!a.parentNode.insertBefore(o,a)}for(var i,s,o,u=[],a=e.scripts[0],f="onreadystatechange",l="readyState";i=n.shift();)s=e.createElement(t),"async"in a?(s.async=!1,e.head.appendChild(s)):a[l]?(u.push(s),s[f]=r):e.write("<"+t+\' src="\'+i+\'" defer></\'+t+">"),s.src=i}(document,"script",["https://ajax.googleapis.com/ajax/libs/webfont/1.6.16/webfont.js","js/init.js"]);</script>';


    // grunt.registerTask('unusedimages', function(test) {
    //     if (test == 'desktop') {
    //         var i_cwd = 'dist/img/';
    //         var i_expand = ['dist/index.php', 'dist/ajax/*.html', 'dist/css/full.min.css', 'dist/js/main.min.js', 'dist/js/map.min.js'];
    //     }

    //     if (test == 'tablet') {
    //         var i_cwd = 'dist/tablet/img/';
    //         var i_expand = ['dist/tablet/index.php', 'dist/tablet/ajax/*.html', 'dist/tablet/css/full.min.css', 'dist/tablet/js/main.min.js', 'dist/tablet/js/map.min.js'];
    //     }

    //     if (test == 'mobile') {
    //         var i_cwd = 'dist/mobile/img/';
    //         var i_expand = ['dist/mobile/index.php', 'dist/mobile/css/full.min.css', 'dist/mobile/js/main.min.js', 'dist/mobile/js/map.min.js'];
    //     }

    //     var assets = [],
    //         links = [];

    //     grunt.file.expand({
    //         filter: 'isFile',
    //         cwd: i_cwd
    //     }, ['**/*']).forEach(function(file) {
    //         assets.push(file);
    //     });

    //     grunt.file.expand({
    //         filter: 'isFile',
    //     }, i_expand).forEach(function(file) {
    //         var content = grunt.file.read(file);
    //         assets.forEach(function(asset) {
    //             if (content.search(asset) !== -1) {
    //                 links.push(asset);
    //             }
    //         });
    //     });

    //     var unused = grunt.util._.difference(assets, links);
    //     // console.log('Found ' + unused.length + ' unused images:');
    //     unused.forEach(function(el) {
    //         grunt.file.delete(i_cwd + el)
    //         // console.log('unused and deleted: ' + i_cwd + el);
    //     });
    // });




    // grunt.registerTask('start-desktop', [
    //     'uglify:desktop_libs', //Минификация src/desktop/js/libs/*.js
    //     'concat:desktop_libs_js', //Склейка src/desktop/js/libs/*.js в src/desktop/js/libs.js
    //     'concat:desktop_libs_css', //Склейка src/desktop/css/libs/*.css в src/desktop/css/libs.css
    //     'csscomb:desktop', //beautify src/desktop/css/**/* 
    //     'htmlcomb:desktop', //beautify src/desktop/index.php ,src/desktop/ajax/map.html часть1
    //     'prettify:desktop', //beautify src/desktop/index.php ,src/desktop/ajax/map.html часть2
    //     'jsbeautifier:desktop', //beautify (src/desktop/js/) init.js, main.js, map.js
    //     //'csslint:desktop'
    // ]);

    // grunt.registerTask('start-tablet', [
    //     'uglify:tablet_libs',
    //     'concat:tablet_libs_js',
    //     'concat:tablet_libs_css',
    //     'csscomb:tablet',
    //     'htmlcomb:tablet',
    //     'prettify:tablet',
    //     'jsbeautifier:tablet',
    //     //'csslint:tablet'
    // ]);

    // grunt.registerTask('start-mobile', [
    //     'uglify:mobile_libs',
    //     'concat:mobile_libs_js',
    //     'concat:mobile_libs_css',
    //     'csscomb:mobile',
    //     'htmlcomb:mobile',
    //     'prettify:mobile',
    //     'jsbeautifier:mobile',
    //     //'csslint:desktop'
    // ]);

    // var critical_array = ['criticalcss:desktop'];

    // if (!mobile && !tablet && adaptive) {
    //     critical_array.push('criticalcss:desktop_tab');
    //     critical_array.push('criticalcss:desktop_mob');
    //     critical_array.push('concat:allcritical');
    // }

    // grunt.registerTask('critical-dtm', critical_array);


    // grunt.registerTask('fin-desktop', [
    //     'concat:desktop_full_css', //Склейка (src/desktop/css/) libs.css,style.css,media.css,scripts.css, в src/desktop/css/full.css
    //     'copy:desktop_for_critical', //Копия (src/desktop/) index.* в кеш файл index_fc.html для выдиление критического css
    //     'critical-dtm', //Выделение критического css для src/desktop/index_fc.html с src/desktop/css/full.css в src/desktop/css/bp/critical.css 
    //     'string-replace:desktop_remove_img_from_head', //Удаление всех графических ресурсов с src/desktop/css/bp/critical.css
    //     'concat:desktop_head_css', // Склейка src/desktop/css/head.css и src/desktop/css/bp/critical.css в src/desktop/css/bp/head.css
    //     'autoprefixer:desktop', //autoprefix src/desktop/css/full.css в src/desktop/css/ap/full.css, src/desktop/css/bp/head.css в src/desktop/css/ap/head.css
    //     'copy:desktop_bp_init_js', //Копирование src/desktop/js/init.js в src/desktop/js/bp/init.js для добавления асинхронной загрузки css
    //     'string-replace:desktop_async_css', //Изменение src/desktop/js/bp/init.js для асинхронной загрузки css
    //     'uglify:desktop_src', //Сжатие (src/desktop/js/) init.js, main.js, init.js в dist/js/*.min.js
    //     'copy:desktop_libs_js', //Копирование src/desktop/js/libs.js в dist/js/libs.min.js
    //     'cssmin:desktop', //Сжатие (src/desktop/css/ap/) head.css,full.css в dist/css/*.min.css
    //     'imagemin:desktop', //Сжатие src/desktop/img/*.* в dist/img/
    //     'clean:desktop', //Удаление src/desktop/index_fc.html,src/desktop/css/bp,src/desktop/css/ap,src/desktop/js/bp
    //     'copy:desktop_fonts',
    //     'copy:desktop_fonts_css',
    //     'copy:desktop_index', //Копирование src/desktop/*.* в dist/
    //     'copy:desktop_httaccess', //Копирование src/desktop/.httaccess в dist/
    //     'copy:desktop_ajax', //Копирование src/desktop/ajax/ в dist/ajax/
    //     'string-replace:desktop_async_init', //добавления блока асинхронной инициализации в index.php
    //     'string-replace:desktop_remove_sync_init', //Удаление синхронной инициализации в index.php
    //     'string-replace:desktop_rebase', //Замена путей к track/ mobile/ tablet/ в dist/ версии desktop
    //     'inlineImgSize:desktop', //Добавление width и height на img
    //     'string-replace:desktop_for_lazyload', //замена установка lazy-load закгрузки <img> на dist/index.php
    //     'string-replace:desktop_for_lazyload_js',
    //     'string-replace:desktop_remove_link_css', //удаление link[rel="stylesheet"] из dist/index.php
    //     'string-replace:desktop_beforebase', //замена путей /img->../img для base64uri маленьких картинок в dist/css/head.min.css
    //     'dataUri:desktop', //перевод картинок до 2048 байт в base64uri в dist/css/head.min.css, dist/css/full.min.css
    //     'string-replace:desktop_afterbase', //замена путей ../img->img непереведдных картинок в dist/css/head.min.css
    //     'htmlmin:desktop', //сжатие dist/index.php и dist/ajax/map.html
    //     'unusedimages:desktop', //Удаление неиспользованных картинок из dist/img/
    //     'copy:track', //Копирование src/track/ в dist/track/
    //     'string-replace:desktop_br_space'
    // ]);

    // grunt.registerTask('fin-tablet', [
    //     'concat:tablet_full_css',
    //     'copy:tablet_for_critical',
    //     'criticalcss:tablet',
    //     'string-replace:tablet_remove_img_from_head',
    //     'concat:tablet_head_css',
    //     'autoprefixer:tablet',
    //     'copy:tablet_bp_init_js',
    //     'string-replace:tablet_async_css',
    //     'uglify:tablet_src',
    //     'copy:tablet_libs_js',
    //     'cssmin:tablet',
    //     'imagemin:tablet',
    //     'clean:tablet',
    //     'copy:tablet_fonts',
    //     'copy:tablet_fonts_css',
    //     'copy:tablet_index',
    //     'copy:tablet_httaccess',
    //     'copy:tablet_ajax',
    //     'string-replace:tablet_async_init',
    //     'string-replace:tablet_remove_sync_init',
    //     'string-replace:tablet_rebase',
    //     'inlineImgSize:tablet',
    //     'string-replace:tablet_for_lazyload',
    //     'string-replace:tablet_for_lazyload_js',
    //     'string-replace:tablet_remove_link_css',
    //     'string-replace:tablet_beforebase',
    //     'dataUri:tablet',
    //     'string-replace:tablet_afterbase',
    //     'htmlmin:tablet',
    //     'unusedimages:tablet',
    //     'string-replace:tablet_br_space'
    // ]);

    // grunt.registerTask('fin-mobile', [
    //     'concat:mobile_full_css',
    //     'copy:mobile_for_critical',
    //     'criticalcss:mobile',
    //     'string-replace:mobile_remove_img_from_head',
    //     'concat:mobile_head_css',
    //     'autoprefixer:mobile',
    //     'copy:mobile_bp_init_js',
    //     'string-replace:mobile_async_css',
    //     'uglify:mobile_src',
    //     'copy:mobile_libs_js',
    //     'cssmin:mobile',
    //     'imagemin:mobile',
    //     'clean:mobile',
    //     'copy:mobile_fonts',
    //     'copy:mobile_fonts_css',
    //     'copy:mobile_index',
    //     'copy:mobile_httaccess',
    //     'copy:mobile_ajax',
    //     'string-replace:mobile_async_init',
    //     'string-replace:mobile_remove_sync_init',
    //     'string-replace:mobile_rebase',
    //     'inlineImgSize:mobile',
    //     'string-replace:mobile_for_lazyload',
    //     'string-replace:mobile_for_lazyload_js',
    //     'string-replace:mobile_remove_link_css',
    //     'string-replace:mobile_beforebase',
    //     'dataUri:mobile',
    //     'string-replace:mobile_afterbase',
    //     'htmlmin:mobile',
    //     'unusedimages:mobile',
    //     'string-replace:mobile_br_space'
    // ]);

    // grunt.registerTask('check-desktop', [
    //     'concat:desktop_libs_css',
    //     'csscomb:desktop'
    // ]);

    // grunt.registerTask('check-tablet', [
    //     'concat:tablet_libs_css',
    //     'csscomb:tablet'
    // ]);

    // grunt.registerTask('check-mobile', [
    //     'concat:mobile_libs_css',
    //     'csscomb:mobile'
    // ]);


    // var start_command = ['start-desktop'];

    // var fin_array = ['clean:dist', 'start-desktop', 'fin-desktop'];

    // //var fin_command = ['fin-desktop'];

    // var validate_command = ['validation'];

    // var check_command = ['check-desktop'];

    // if (tablet) {
    //     //fin_command.push('fin-tablet');
    //     start_command.push('start-tablet');
    //     fin_array.push('start-tablet').push('fin-tablet');
    //     check_command.push('check-tablet');
    // }

    // if (mobile) {
    //     //fin_command.push('fin-mobile');
    //     start_command.push('start-mobile');
    //     fin_array.push('start-mobile').push('fin-mobile');
    //     check_command.push('check-mobile');
    // }

    // fin_array.push('validation:dist');

    // check_command.push('validation:src');

    // grunt.registerTask('check', check_command);
    // grunt.registerTask('start', start_command);
    // grunt.registerTask('fin', fin_array);
    // grunt.registerTask('default', ['watch']);
    // grunt.registerTask('ftp', ['ftpush']);


};