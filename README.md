# Scrutiny Academy — Class 10 Board Booster 2027

Mobile-first storefront for Telangana SSC Class 10 premium revision sheets.

## Launch pricing
- Biology: ₹11 complete subject access — available
- Physics: ₹11 — coming soon
- Mathematics: ₹11 — coming soon
- Social Studies: ₹11 — coming soon
- Hindi First Language: ₹11 — coming soon
- Telugu Second Language: ₹11 — coming soon

## Important production setup
The public storefront is implemented in `index.html`. Live payment is deliberately not simulated. Before accepting money, add a secure server-side Razorpay order/verification/webhook service, authentication, persistent purchase records, and private PDF storage. Never commit the Razorpay key secret or private premium PDFs to this public repository.

A static GitHub Pages frontend cannot securely hold Razorpay secrets or enforce protected paid PDF authorization by itself. Deploy the payment/auth/file-access backend on a server-capable platform and connect the frontend to it.

## Support
- Email: scrutinyacademy@gmail.com
- WhatsApp: +91 9052389200
- YouTube: http://www.youtube.com/@ScrutinyAcademy
- Instagram: https://www.instagram.com/scrutinyacademy?stkn=MWttYnR3azB5bjAzYg%3D%3D&utm_source=qr
