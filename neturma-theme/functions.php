<?php

defined( 'ABSPATH' ) || exit;

function neturma_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'script', 'style', 'gallery', 'caption' ) );
}
add_action( 'after_setup_theme', 'neturma_setup' );

function neturma_assets() {
	$version = wp_get_theme()->get( 'Version' );
	wp_enqueue_style( 'neturma-main', get_theme_file_uri( 'assets/main.css' ), array(), $version );
	wp_enqueue_script( 'neturma-content', get_theme_file_uri( 'assets/content.js' ), array(), $version, true );
	wp_enqueue_script( 'neturma-main', get_theme_file_uri( 'assets/main.js' ), array( 'neturma-content' ), $version, true );
}
add_action( 'wp_enqueue_scripts', 'neturma_assets' );

function neturma_script_type( $tag, $handle, $src ) {
	if ( 'neturma-main' !== $handle ) {
		return $tag;
	}

	return '<script type="module" src="' . esc_url( $src ) . '"></script>';
}
add_filter( 'script_loader_tag', 'neturma_script_type', 10, 3 );

function neturma_acf_options() {
	if ( ! function_exists( 'acf_add_options_page' ) ) {
		return;
	}

	acf_add_options_page(
		array(
			'page_title' => 'Контент сайта',
			'menu_title' => 'Контент сайта',
			'menu_slug'  => 'neturma-content',
			'capability' => 'edit_pages',
			'position'   => 3,
			'icon_url'   => 'dashicons-art',
			'redirect'   => false,
		)
	);
}
add_action( 'acf/init', 'neturma_acf_options' );

function neturma_field( $name, $default = '' ) {
	if ( ! function_exists( 'get_field' ) ) {
		return $default;
	}

	$value = get_field( $name, 'option' );

	return null === $value || '' === $value || false === $value ? $default : $value;
}

function neturma_image_url( $image ) {
	if ( is_array( $image ) && ! empty( $image['url'] ) ) {
		return $image['url'];
	}

	if ( is_numeric( $image ) ) {
		return wp_get_attachment_image_url( (int) $image, 'full' ) ?: '';
	}

	return is_string( $image ) ? $image : '';
}

function neturma_gallery_data( $name ) {
	$gallery = neturma_field( $name, array() );
	$data    = array();

	if ( ! is_array( $gallery ) ) {
		return $data;
	}

	foreach ( $gallery as $image ) {
		$url = neturma_image_url( $image );
		if ( ! $url ) {
			continue;
		}
		$data[] = array(
			'url' => $url,
			'alt' => is_array( $image ) && ! empty( $image['alt'] ) ? $image['alt'] : '',
		);
	}

	return $data;
}

function neturma_link_data( $name, $default_url = '', $default_title = '' ) {
	$link = neturma_field( $name, array() );

	if ( ! is_array( $link ) ) {
		return array( 'url' => $default_url, 'title' => $default_title, 'target' => '' );
	}

	return array(
		'url'    => $link['url'] ?? $default_url,
		'title'  => $link['title'] ?? $default_title,
		'target' => $link['target'] ?? '',
	);
}

function neturma_content_data() {
	return array(
		'hero' => array(
			'year'   => neturma_field( 'hero_year', '1855' ),
			'city'   => neturma_field( 'hero_city', 'Арт-город' ),
			'slogan' => neturma_field( 'hero_slogan', 'Город Мышкин' ),
			'button' => neturma_field( 'hero_button', 'Стать жителем' ),
		),
		'sections' => array(
			'about' => array(
				'title'    => neturma_field( 'about_title', 'О проекте' ),
				'subtitle' => neturma_field( 'about_subtitle', '' ),
				'content'  => neturma_field( 'about_content', '' ),
			),
			'art' => array(
				'title'    => neturma_field( 'art_title', 'Арт-объекты' ),
				'subtitle' => neturma_field( 'art_subtitle', '' ),
				'intro'    => neturma_field( 'art_intro', '' ),
				'outro'    => neturma_field( 'art_outro', '' ),
			),
			'visit' => array(
				'title'    => neturma_field( 'visit_title', 'О посещении' ),
				'subtitle' => neturma_field( 'visit_subtitle', '' ),
				'location' => neturma_field( 'visit_location', '' ),
			),
			'freedom' => array(
				'title'    => neturma_field( 'freedom_title', 'О свободе' ),
				'subtitle' => neturma_field( 'freedom_subtitle', '' ),
				'content'  => neturma_field( 'freedom_content', '' ),
			),
			'food' => array(
				'title'    => neturma_field( 'food_title', 'О еде' ),
				'subtitle' => neturma_field( 'food_subtitle', '' ),
				'content'  => neturma_field( 'food_content', '' ),
			),
		),
		'ticket' => neturma_link_data( 'ticket_link', '/', 'Купить билет' ),
		'artGallery' => neturma_gallery_data( 'art_gallery' ),
		'foodGallery' => neturma_gallery_data( 'food_gallery' ),
		'foodSlider' => neturma_gallery_data( 'food_slider' ),
		'faq' => neturma_field( 'faq', array() ),
		'contacts' => array(
			'infoEmail' => neturma_field( 'info_email', 'info@neturma.ru' ),
			'contactEmail' => neturma_field( 'contact_email', '' ),
			'phones' => neturma_field( 'phones', array() ),
			'socials' => neturma_field( 'socials', array() ),
			'copyright' => neturma_field( 'copyright', 'НЕТЮРЬМА. 2026. Все права защищены.' ),
		),
		'requisites' => array(
			'company' => neturma_field( 'company_name', 'ООО «Саммит»' ),
			'inn' => neturma_field( 'company_inn', '7719676182' ),
			'ogrn' => neturma_field( 'company_ogrn', '1087746466334' ),
			'documents' => neturma_field( 'documents', array() ),
		),
	);
}

function neturma_print_content_data() {
	$data = wp_json_encode( neturma_content_data(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );
	if ( ! $data ) {
		return;
	}

	echo '<script>window.neturmaContent=' . $data . ';</script>';
}
add_action( 'wp_footer', 'neturma_print_content_data', 1 );
