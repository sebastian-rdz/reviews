<?php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000', 'http://192.168.100.33:3000', 'http://localhost:3100'], // exacto, no '*'  // NOTE: localhost:3100 added TEMPORARILY for local style-PR preview — revert before committing
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];