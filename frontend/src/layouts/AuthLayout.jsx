import { Link } from "react-router-dom";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-primary">
            CuentasControl
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
          {title && (
            <h1 className="text-xl font-semibold text-gray-900 mb-1">{title}</h1>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 mb-6">{subtitle}</p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
