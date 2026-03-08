export const metadata = {
  title: 'Сигурен трансфер',
  description: 'Формуляр за прехвърляне с потвърждение на код',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
          background: '#0b1220',
          color: '#0f172a',
        }}
      >
        {children}
      </body>
    </html>
  );
}
