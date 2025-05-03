import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Appimate",
        short_name: "Appimate",
        description: "APPIMATE is an AI technology company specialising in consumer software products and enterprise solutions.",
        start_url: "/",
        background_color: "#FFFFFF",
        theme_color: "#00FFFF",
        display: "standalone",
        icons: [
            {
                src: "assets/icons/ICON 48x48.png",
                type: "image/png",
                sizes: "48x48"
            },
            {
                src: "assets/icons/ICON 57x57.png",
                type: "image/png",
                sizes: "57x57"
            },
            {
                src: "assets/icons/ICON 96x96.png",
                type: "image/png",
                sizes: "96x96"
            },
            {
                src: "assets/icons/ICON 144x144.png",
                type: "image/png",
                sizes: "144x144"
            },
            {
                src: "assets/icons/ICON 152x152.png",
                type: "image/png",
                sizes: "152x152"
            },
            {
                src: "assets/icons/ICON 167x167.png",
                type: "image/png",
                sizes: "167x167"
            },
            {
                src: "assets/icons/ICON 180x180.png",
                type: "image/png",
                sizes: "180x180"
            },
            {
                src: "assets/icons/ICON 192x192.png",
                type: "image/png",
                sizes: "192x192"
            },
            {
                src: "assets/icons/ICON 196x196.png",
                type: "image/png",
                sizes: "196x196"
            },
            {
                src: "assets/icons/ICON 512x512.png",
                type: "image/png",
                sizes: "512x512"
            },
            {
                src: "assets/icons/ICON 512x512.png",
                type: "image/png",
                sizes: "512x512",
                purpose: "maskable"
            }
        ],
        related_applications: [
            {
                platform: "play",
                url: "https://play.google.com/store/apps/details?id=com.appimate.appimate"
            },
            {
                platform: "itunes",
                url: "https://apps.apple.com/apps/details?id=com.appimate.appimate"
            }
        ],
        shortcuts: [
            {
                name: "Notifications",
                short_name: "Notifications",
                description: "Quickly check your Notifications.",
                url: "./dashboard/notifications",
                icons: [
                    {
                        src: "assets/icons/shortcut-notify.png",
                        sizes: "96x96",
                        type: "image/png"
                    }
                ]
            }
        ]
    }
}