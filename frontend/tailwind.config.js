export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                sand: '#f6f0e6',
                linen: '#efe5d8',
                moss: '#5d745e',
                olive: '#7d9273',
                sage: '#aab8a2',
                clay: '#d9ccb8',
                ink: '#314236',
            },
            fontFamily: {
                sans: ['"Poppins"', 'sans-serif'],
                display: ['"Poppins"', 'sans-serif'],
            },
            boxShadow: {
                glass: '0 20px 44px rgba(49, 66, 54, 0.14)',
                soft: '0 28px 80px rgba(49, 66, 54, 0.12)',
                float: '0 30px 90px rgba(49, 66, 54, 0.16)',
            },
            backgroundImage: {
                grain: 'radial-gradient(circle at top, rgba(255,255,255,0.45), transparent 42%), linear-gradient(135deg, rgba(246,240,230,0.95), rgba(239,229,216,0.92))',
            },
        },
    },
    plugins: [],
};
