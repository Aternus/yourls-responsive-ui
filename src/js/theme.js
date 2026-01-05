console.log("Responsive UI");

const root = document.documentElement;
const themeMeta = document.querySelector('meta[name="responsive_theme"]');
const theme = themeMeta
    ? themeMeta.getAttribute("content")
    : RESPONSIVE_THEME_DARK;

if (theme === RESPONSIVE_THEME_LIGHT || theme === RESPONSIVE_THEME_DARK) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
}

$(document).ready(function () {
    // Get the theme URL
    let url;
    if ($("meta[name=pluginURL]").attr("content")) {
        url = $("meta[name=pluginURL]").attr("content");
    } else {
        // If for some reason we can't find the URL attribute
        url = "/user/plugins/yours-responsive-ui";
    }

    console.log("Theme is", theme);

    // Update favicon
    $('link[rel="shortcut icon"]').attr(
        "href",
        url + "/assets/img/favicon.ico",
    );

    // Detect pages
    if ($("body").hasClass("login")) {
        // Login page
        console.log("Login page");

        if (theme == RESPONSIVE_THEME_LIGHT) {
            $("#login").prepend(
                `<img class="login-logo" src="${url}/assets/img/logo_black.png">`,
            );
        } else if (theme == RESPONSIVE_THEME_DARK) {
            $("#login").prepend(
                `<img class="login-logo" src="${url}/assets/img/logo_white.png">`,
            );
        }
    } else if ($("body").hasClass("index")) {
        // Index page
        console.log("Index page");

        handleNav();

        // Hide YOURLS new URL section
        $("#new_url").hide();

        // Grab the nonce id
        var nonce = $("#nonce-add").val();

        // Remove the YOURLS new URL Section
        $("#new_url").remove();

        // Create the responsive new URL section from the template
        $("nav").append(
            $("<div>").load(`${url}/assets/html/form.html`, function () {
                $("#nonce-add").val(nonce);
            }),
        );
    } else if ($("body").hasClass("tools")) {
        // Tools page
        console.log("Tools page");

        handleNav();
    } else if ($("body").hasClass("plugins")) {
        // Plugins page
        console.log("Plugins page");

        handleNav();
    } else if ($("body").hasClass("plugin_page_responsive_settings")) {
        // Tools page
        console.log("responsive Settings Page");

        handleNav();

        $("#ui_selector").val($("#ui_selector").attr("value"));
    } else if ($("body").hasClass("infos")) {
        // Information page
        console.log("Information page");

        handleNav();

        $("#historical_clicks li").each(function (index) {
            if (index % 2 != 0) {
                $("#historical_clicks li").eq(index).css("background", "");
            }
        });

        // Update tab headers
        var titles = ["Statistics", "Location", "Sources"];
        for (let i = 0; i < 3; i++) {
            $($("#headers > li")[i]).find("h2").text(titles[i]);
        }
    } else {
        console.warn("Unknown page");

        handleNav();
    }

    function handleNav() {
        // Add logo
        $("#wrap").prepend(
            `<img class="logo" src="${url}/assets/img/logo_white.png">`,
        );

        // Add mobile nav hamburger
        $("#wrap").prepend(
            `<div class="nav-open" id="navOpen"><i class="material-icons">menu</i></div>`,
        );

        // admin_menu
        $("#navOpen").on("click", function () {
            $("#admin_menu").slideToggle();
        });

        $(window).resize(function () {
            if ($(window).width() > 899) {
                $("#admin_menu").show();
            } else {
                $("#admin_menu").hide();
            }
        });
    }

    // Update P elements
    $("p").each(function (index) {
        if (/Display/.test($(this).text()) || /Overall/.test($(this).text())) {
            // Move info on index page to the bottom
            $("main").append("<p>" + $(this).html() + "</p>");
            $(this).remove();
        } else if (/Powered by/.test($(this).text())) {
            // Update footer
            var content = $(this).html();
            var updated_content = `Running on <br> ${content.replace(/Powered by.*?(?=<|$)/i, "")} <br> <a href="https://atern.us/" title="responsive">Responsive UI</a>`;
            $(this).html(updated_content);
        }
    });
});
