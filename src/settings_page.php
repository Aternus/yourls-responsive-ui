<?php

function responsive_settings_update(): void {
    $selected_color_scheme = $_POST['responsive_color_scheme'];

    if ( $selected_color_scheme ) {
        if ( $selected_color_scheme == RESPONSIVE_SCHEME_LIGHT or $selected_color_scheme == RESPONSIVE_SCHEME_DARK ) {
            yourls_update_option( 'responsive_color_scheme',
                $selected_color_scheme );
        } else {
            echo "Error";
        }
    }
}

function responsive_settings_handler(): void {
    // Check if a form was submitted
    if ( isset( $_POST['responsive_color_scheme'] ) ) {
        // Check nonce
        yourls_verify_nonce( 'responsive_settings' );

        // Process form
        responsive_settings_update();
    }

    // Get value from the database
    $responsive_color_scheme = yourls_get_option( 'responsive_color_scheme' );

    // Create nonce
    $nonce = yourls_create_nonce( 'responsive_settings' );

    $dark  = RESPONSIVE_SCHEME_DARK;
    $light = RESPONSIVE_SCHEME_LIGHT;

    $dark_selected  = ( $responsive_color_scheme === $dark ) ? 'selected' : '';
    $light_selected = ( $responsive_color_scheme === $light ) ? 'selected' : '';

    echo <<<HTML
        <main>
        	<h2>Responsive UI Settings</h2>
        	<form method="post">
        	<input type="hidden" name="nonce" value="$nonce" />
        	<p>
        		<label>Theme</label>
        		<select name="responsive_color_scheme" id="ui_selector">
        			<option value="$dark" $dark_selected>Dark</option>
        			<option value="$light" $light_selected>Light</option>
        		</select>
        	</p>
        	<p><input type="submit" value="Save" class="button" /></p>
        	</form>
        </main>
        HTML;
}

function responsive_settings(): void {
    yourls_register_plugin_page( 'responsive_settings',
        'Responsive UI Settings', 'responsive_settings_handler' );
}

yourls_add_action( 'plugins_loaded', 'responsive_settings' );
