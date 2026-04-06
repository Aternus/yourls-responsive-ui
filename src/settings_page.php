<?php

function responsive_settings_update(): void {
    $color_scheme = responsive_sanitize_color_scheme(
        $_POST['responsive_color_scheme'] ?? '',
    );

    yourls_update_option( 'responsive_color_scheme', $color_scheme );
}

function responsive_settings_handler(): void {
    if ( isset( $_POST['responsive_color_scheme'] ) ) {
        yourls_verify_nonce( 'responsive_settings' );

        responsive_settings_update();
    }

    $color_scheme = responsive_get_color_scheme();

    $nonce = yourls_create_nonce( 'responsive_settings' );

    $system = RESPONSIVE_SCHEME_SYSTEM;
    $dark   = RESPONSIVE_SCHEME_DARK;
    $light  = RESPONSIVE_SCHEME_LIGHT;

    $system_selected = ( $color_scheme === $system ) ? 'selected' : '';
    $dark_selected   = ( $color_scheme === $dark ) ? 'selected' : '';
    $light_selected  = ( $color_scheme === $light ) ? 'selected' : '';

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
