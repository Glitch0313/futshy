import 'bootstrap/dist/css/bootstrap.min.css';

export const metadata = {
  title: 'My App',
  description: 'Next.js App with CRUD and Notifications',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
