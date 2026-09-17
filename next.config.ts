import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
    ],
  },
  output: 'standalone',
  transpilePackages: ['motion'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https:",
              "frame-src https://www.youtube.com https://youtube.com",
              // Vídeos enviados por upload (Supabase Storage) ou linkados de
              // qualquer host externo passam por media-src, não img-src —
              // sem isso o <video> nem tentava carregar (ficava "tudo preto").
              "media-src 'self' https:",
              // Precisa de https: amplo (não só o domínio do Supabase) porque
              // o admin pode cadastrar qualquer URL de imagem externa, e o
              // next/image + as miniaturas do YouTube (img.youtube.com)
              // contam como conexão (fetch/XHR) para o navegador, não só img-src.
              // wss: é necessário pro Supabase Realtime (WebSocket) — connect-src
              // não trata "https:" como cobrindo "wss:", são esquemas distintos.
              "connect-src 'self' https: wss:",
            ].join('; '),
          },
        ],
      },
    ];
  },
  webpack: (config, {dev}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
