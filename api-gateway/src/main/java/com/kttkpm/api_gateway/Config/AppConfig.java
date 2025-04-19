package com.kttkpm.api_gateway.Config;

// Xóa các import của web.servlet
// import org.springframework.web.servlet.config.annotation.CorsRegistry;
// import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Thêm các import cho WebFlux CORS
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter; // Quan trọng: reactive
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource; // Quan trọng: reactive
import java.util.Arrays;
import java.util.Collections; // Hoặc dùng Arrays.asList

// Các import khác của bạn (lombok, security nếu cần)
import lombok.RequiredArgsConstructor;
// import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity; // Dùng cái này nếu bật Security
// import org.springframework.security.config.web.server.ServerHttpSecurity; // Dùng cái này nếu bật Security
// import org.springframework.security.web.server.SecurityWebFilterChain; // Dùng cái này nếu bật Security

@Configuration
// @EnableWebFluxSecurity // Bỏ comment nếu bạn BẬT Spring Security cho Gateway (LƯU Ý: DÙNG EnableWebFluxSecurity)
@RequiredArgsConstructor
public class AppConfig {

    // Các phần Spring Security đã comment vẫn giữ nguyên, nhưng LƯU Ý rằng
    // nếu bạn bật Security cho Gateway, bạn cần dùng cấu hình REACTIVE
    // (ServerHttpSecurity, SecurityWebFilterChain, ...) thay vì HttpSecurity.
    // Đây là một chủ đề phức tạp hơn. Tạm thời tập trung vào CORS.


    /**
     * Cấu hình CORS (Cross-Origin Resource Sharing) cho toàn bộ ứng dụng Gateway.
     * Sử dụng CorsWebFilter của Spring WebFlux.
     */
    @Bean
    public CorsWebFilter corsWebFilter() { // Thay thế WebMvcConfigurer bằng CorsWebFilter
        CorsConfiguration corsConfig = new CorsConfiguration();

        // Thay thế .allowedOriginPatterns("*") hoặc .allowedOrigins(...) bằng các dòng dưới
        // corsConfig.setAllowedOrigins(Arrays.asList("http://localhost:5500", "http://localhost:9000")); // Liệt kê các origins được phép
        corsConfig.setAllowedOriginPatterns(Collections.singletonList("*")); // Cho phép mọi origin (cẩn thận với production)

        corsConfig.setMaxAge(3600L); // Tương đương maxAge(3600)
        corsConfig.addAllowedMethod("*"); // Cho phép tất cả các method (GET, POST, PUT, DELETE, OPTIONS, PATCH)
        corsConfig.addAllowedHeader("*"); // Cho phép tất cả các header
        corsConfig.setAllowCredentials(true); // Tương đương allowCredentials(true)

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig); // Áp dụng cấu hình cho tất cả các đường dẫn (/**)

        return new CorsWebFilter(source);
    }

    /*
    // =============================================================================
    // PHẦN CẤU HÌNH SPRING SECURITY (ĐANG ĐƯỢC COMMENT OUT)
    // LƯU Ý QUAN TRỌNG: Nếu bạn bỏ comment phần này để dùng Security cho Gateway,
    // bạn PHẢI chuyển đổi sang cấu hình Reactive Security.
    // Ví dụ: Dùng ServerHttpSecurity thay vì HttpSecurity, SecurityWebFilterChain thay vì SecurityFilterChain,
    // @EnableWebFluxSecurity thay vì @EnableWebSecurity, các filter reactive tương ứng.
    // =============================================================================

    // Ví dụ cấu trúc Security cho Reactive (CHỈ LÀ VÍ DỤ, cần chỉnh sửa)
    // @Bean
    // public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
    //     http
    //         .csrf(csrf -> csrf.disable()) // Tắt CSRF
    //         .authorizeExchange(exchanges -> exchanges
    //             .pathMatchers("/api/v1/auth/**", "/public/**").permitAll() // URL công khai
    //             .pathMatchers("/api/v1/admin/**").hasRole("ADMIN") // Phân quyền (ví dụ)
    //             .anyExchange().authenticated() // Các request khác cần xác thực
    //         );
    //         // Thêm cấu hình xác thực (ví dụ: OAuth2, JWT reactive filter) ở đây
    //     return http.build();
    // }

    // Các bean khác như PasswordEncoder, AuthenticationProvider cũng cần xem xét lại
    // trong ngữ cảnh Reactive nếu Security được bật.
    */

}