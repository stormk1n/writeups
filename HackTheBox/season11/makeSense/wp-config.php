<?php
// SQLite database configuration
define( 'DB_DIR', __DIR__ . '/wp-content/database/' );
define( 'DB_FILE', '.ht.sqlite' );

// Dummy MySQL settings (required but not used with SQLite)
define( 'DB_NAME', 'wordpress' );
define( 'DB_USER', 'walter' );
define( 'DB_PASSWORD', 'JbhHDAEgXvri3!' );
define( 'DB_HOST', 'localhost' );
define( 'DB_CHARSET', 'utf8' );
define( 'DB_COLLATE', '' );

$table_prefix = 'wp_';
define( 'WP_DEBUG', false );

define('AUTH_KEY',         '%88$_8C0xYR s^9jz;F epY,CO|+Up#ZFIdRS&Gqd~5O/|<^7DmLtEm=SjV|jmWZ');
define('SECURE_AUTH_KEY',  'BD-p*m6hvWAGGBDg%_UC,|>};`C2<1uK>*x!h.Wf*dE;lbhaQVbHw+uc@6OfH>B%');
define('LOGGED_IN_KEY',    ';2fn^sP8F`HK0g,8C&2ar})EifGz@,5Z1{IoDD+CzOT@3w[g~*aM-+=zWcxGBYk2');
define('NONCE_KEY',        's>>f8%soM5P=D$J9UXV-kF]lKZ92.KF%FDS#+! ;(A|C9kMWT(=A>99->-$$>UvU');
define('AUTH_SALT',        'V 0X(1n-@p&})rQpQB_mEax]D9Z*;iM+23&b]!53._;,).:Lj?1ky56*Vaa~KF(B');
define('SECURE_AUTH_SALT', '-{[x4pgl %S5{_s}nE!%H8,05AO_699M4_[mLt^tVC$Kh4;s|n8~O<CSE4#uPWN.');
define('LOGGED_IN_SALT',   'wUxZI^1#)4o)C1KJ8a5o-k{V3L)agi|fofV0SzuSUI;1k%1 !9Q!P@-*j8Y_j%$;');
define('NONCE_SALT',       'j #rMhd[olj2$j8|QAF7L8rR-D kf&gs,:oX4py6x?6V3|oJ?[b~h,[~3uhH.|X%');

if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', __DIR__ . '/' );
}

define( 'WP_SQLITE_PLUGIN', true );
require_once ABSPATH . 'wp-settings.php';
