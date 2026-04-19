<?php

namespace YOURLSResponsiveUI\Sniffs\WhiteSpace;

use PHP_CodeSniffer\Files\File;
use PHP_CodeSniffer\Sniffs\Sniff;

/**
 * Enforces a maximum number of consecutive blank lines.
 */
class ConsecutiveBlankLinesSniff implements Sniff {

    //
    // Rules.
    //

    /**
     * Maximum number of consecutive blank lines.
     *
     * @var int
     */
    public int $max_blank_lines = 1;

    /**
     * Registers tokens that this sniff checks.
     *
     * @return array<int>
     */
    public function register(): array {
        return [
            T_WHITESPACE,
        ];
    }

    /**
     * Processes whitespace tokens and removes extra blank lines.
     *
     * @param File $phpcs_file PHPCS file object.
     * @param int  $stack_ptr  Current token position.
     */
    public function process( File $phpcs_file, $stack_ptr ): void {
        $tokens = $phpcs_file->getTokens();

        if ( $stack_ptr > 0 && $tokens[ $stack_ptr - 1 ]['code'] === T_WHITESPACE ) {
            return;
        }

        $next_non_whitespace = $phpcs_file->findNext(
            T_WHITESPACE,
            $stack_ptr,
            null,
            true,
        );
        if ( $next_non_whitespace === false ) {
            return;
        }

        $prev_non_whitespace = $phpcs_file->findPrevious(
            T_WHITESPACE,
            $stack_ptr - 1,
            null,
            true,
        );
        if ( $prev_non_whitespace === false ) {
            return;
        }

        $found_blank_lines = $tokens[ $next_non_whitespace ]['line'] - $tokens[ $prev_non_whitespace ]['line'] - 1;
        if ( $found_blank_lines <= (int) $this->max_blank_lines ) {
            return;
        }

        $whitespace = '';
        for ( $i = $stack_ptr; $i < $next_non_whitespace; $i++ ) {
            $whitespace .= $tokens[ $i ]['content'];
        }

        if ( ! str_contains( $whitespace, "\n" ) && ! str_contains( $whitespace, "\r" ) ) {
            return;
        }

        $prev_content = $tokens[ $prev_non_whitespace ]['content'];
        $fixed        = $this->build_fixed_whitespace(
            $phpcs_file,
            $whitespace,
            $prev_content,
        );
        if ( $fixed === $whitespace ) {
            return;
        }

        $fix = $this->add_fixable_error(
            $phpcs_file,
            $stack_ptr,
            $found_blank_lines,
        );
        if ( ! $fix ) {
            return;
        }

        $phpcs_file->fixer->beginChangeset();
        for ( $i = $stack_ptr; $i < $next_non_whitespace; $i++ ) {
            $phpcs_file->fixer->replaceToken( $i, '' );
        }

        $phpcs_file->fixer->addContentBefore( $next_non_whitespace, $fixed );
        $phpcs_file->fixer->endChangeset();
    }

    private function build_fixed_whitespace(
        File $phpcs_file,
        string $whitespace,
        string $prev_content,
    ): string {
        $normalized_whitespace = str_replace( [ "\r\n", "\r" ], "\n", $whitespace );
        $first_break_pos       = strpos( $normalized_whitespace, "\n" );
        $last_break_pos        = strrpos( $normalized_whitespace, "\n" );
        if ( $first_break_pos === false || $last_break_pos === false ) {
            return $whitespace;
        }

        $normalized_prev    = str_replace( [ "\r\n", "\r" ], "\n", $prev_content );
        $prev_ends_with_eol = str_ends_with( $normalized_prev, "\n" );
        $required_breaks    = ( (int) $this->max_blank_lines ) + 1;
        if ( $prev_ends_with_eol ) {
            --$required_breaks;
        }

        $required_breaks = max( 0, $required_breaks );
        $leading_part    = substr( $normalized_whitespace, 0, $first_break_pos );
        $trailing_part   = substr( $normalized_whitespace, $last_break_pos + 1 );
        $fixed_content   = $leading_part . str_repeat( "\n", $required_breaks ) . $trailing_part;
        $eol_char        = $phpcs_file->eolChar; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- PHPCS File API property name.
        if ( $eol_char !== "\n" ) {
            return str_replace( "\n", $eol_char, $fixed_content );
        }

        return $fixed_content;
    }

    /**
     * Adds a fixable error for extra blank lines.
     *
     * @param File $phpcs_file       PHPCS file object.
     * @param int  $stack_ptr        Current token position.
     * @param int  $found_blank_lines Number of blank lines found.
     */
    private function add_fixable_error(
        File $phpcs_file,
        int $stack_ptr,
        int $found_blank_lines,
    ): bool {
        return $phpcs_file->addFixableError(
            'Expected at most %s consecutive blank line(s); found %s',
            $stack_ptr,
            'Found',
            [
                (int) $this->max_blank_lines,
                $found_blank_lines,
            ],
        );
    }
}
