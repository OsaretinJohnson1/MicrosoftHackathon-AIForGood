import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  images: {
        remotePatterns: [
            {protocol: "http", hostname: "localhost"},
            {protocol: "https", hostname: "source.unsplash.com"},
            {protocol: "https", hostname: "lh3.googleusercontent.com"},
            {protocol: "https", hostname: "avatar.githubusercontent.com"},
            {protocol: "https", hostname: "agraph.facebook.com"},
            {protocol: "https", hostname: "www.google.com"},
            {protocol: "https", hostname: "ubuntu-lend.azurewebsites.net"},
            {protocol: "https", hostname: "ubuntu-lend.com"},
            {protocol: "https", hostname: "ubuntu-lend.co.za"},
            {protocol: "https", hostname: "dalleprodsec.blob.core.windows.net"},
        ]
    }
};

export default nextConfig;

import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  images: {
        remotePatterns: [
            {protocol: "http", hostname: "localhost"},
            {protocol: "https", hostname: "source.unsplash.com"},
            {protocol: "https", hostname: "lh3.googleusercontent.com"},
            {protocol: "https", hostname: "avatar.githubusercontent.com"},
            {protocol: "https", hostname: "agraph.facebook.com"},
            {protocol: "https", hostname: "www.google.com"},
            {protocol: "https", hostname: "ubuntu-lend.azurewebsites.net"},
            {protocol: "https", hostname: "ubuntu-lend.com"},
            {protocol: "https", hostname: "ubuntu-lend.co.za"},
        ]
    }
};

export default nextConfig;
