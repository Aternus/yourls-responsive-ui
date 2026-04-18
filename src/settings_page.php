<?php

function responsive_settings_update(): void
{
    $color_scheme = responsive_sanitize_color_scheme(
        $_POST['responsive_color_scheme'] ?? '',
    );
    $show_footer_text = isset($_POST['responsive_show_footer_text']) ? 1 : 0;
    $show_help_link = isset($_POST['responsive_show_help_link']) ? 1 : 0;

    yourls_update_option(RESPONSIVE_OPTION_COLOR_SCHEME, $color_scheme);
    yourls_update_option(
        RESPONSIVE_OPTION_SHOW_FOOTER_TEXT,
        $show_footer_text,
    );
    yourls_update_option(RESPONSIVE_OPTION_SHOW_HELP_LINK, $show_help_link);
}

function responsive_settings_handle_save(): void
{
    if (
        ! (
            isset($_POST['responsive_settings_submit']) &&
            $_POST['responsive_settings_submit'] === 'save'
        )
    ) {
        return;
    }

    yourls_verify_nonce('responsive_settings');
    responsive_settings_update();
}

function responsive_settings_handler(): void
{
    $color_scheme = responsive_get_color_scheme();
    $show_footer_text = responsive_is_show_footer_text();
    $show_help_link = responsive_is_show_help_link();

    $nonce = yourls_create_nonce('responsive_settings');

    $system = RESPONSIVE_SCHEME_SYSTEM;
    $dark = RESPONSIVE_SCHEME_DARK;
    $light = RESPONSIVE_SCHEME_LIGHT;

    $system_selected = $color_scheme === $system ? 'selected' : '';
    $dark_selected = $color_scheme === $dark ? 'selected' : '';
    $light_selected = $color_scheme === $light ? 'selected' : '';
    $show_footer_text_checked = $show_footer_text ? 'checked' : '';
    $show_help_link_checked = $show_help_link ? 'checked' : '';

    echo <<<HTML
        <main>
        	<h2>Responsive UI Settings</h2>
        	<form method="post">
        	<input type="hidden" name="nonce" value="$nonce" />
        	<p>
        		<label>Color Scheme</label>
        		<select name="responsive_color_scheme">
        			<option value="$system" $system_selected>System</option>
        			<option value="$dark" $dark_selected>Dark</option>
        			<option value="$light" $light_selected>Light</option>
        		</select>
        	</p>
            <p>
                <label for="responsive_show_footer_text">
                    <input type="checkbox" id="responsive_show_footer_text" name="responsive_show_footer_text" value="1" $show_footer_text_checked />
                    Show footer text
                </label>
            </p>
            <p>
                <label for="responsive_show_help_link">
                    <input type="checkbox" id="responsive_show_help_link" name="responsive_show_help_link" value="1" $show_help_link_checked />
                    Show help link
                </label>
            </p>
        	<p><button type="submit" name="responsive_settings_submit" value="save" class="button">Save</button></p>
        	</form>
        </main>
        HTML;
}

function responsive_settings(): void
{
    yourls_register_plugin_page(
        'responsive_settings',
        'Responsive UI Settings',
        'responsive_settings_handler',
    );
    yourls_add_action(
        'load-responsive_settings',
        'responsive_settings_handle_save',
    );
}

yourls_add_action('plugins_loaded', 'responsive_settings');
