import { Outlet, NavLink } from 'react-router-dom';
import { User } from '../types';

interface LayoutProps {
  userData: User | null;
}

const Layout = ({ userData }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-green-700 dark:text-green-400">🌼 Флористы</h1>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900 px-3 py-1 rounded-full">
                <span>🪙</span>
                <span className="font-semibold dark:text-yellow-200">{userData?.coins ?? 0}</span>
              </div>
              <div className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900 px-3 py-1 rounded-full">
                <span>💎</span>
                <span className="font-semibold dark:text-purple-200">{userData?.gems ?? 0}</span>
              </div>
              <NavLink
                to="/profile"
                className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-sm"
                title="Профиль"
              >
                {userData?.photoURL || '?'}
              </NavLink>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-[73px] z-10">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `py-3 px-2 font-medium transition-colors ${
                  isActive
                    ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                    : 'text-gray-500 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
                }`
              }
            >
              🌱 Сад
            </NavLink>
            <NavLink
              to="/shop"
              className={({ isActive }) =>
                `py-3 px-2 font-medium transition-colors ${
                  isActive
                    ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                    : 'text-gray-500 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
                }`
              }
            >
              🛍️ Магазин
            </NavLink>
            <NavLink
              to="/auction"
              className={({ isActive }) =>
                `py-3 px-2 font-medium transition-colors ${
                  isActive
                    ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                    : 'text-gray-500 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
                }`
              }
            >
              🎨 Аукцион
            </NavLink>
            <NavLink
              to="/battlepass"
              className={({ isActive }) =>
                `py-3 px-2 font-medium transition-colors ${
                  isActive
                    ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                    : 'text-gray-500 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
                }`
              }
            >
              📜 Пропуск
            </NavLink>
            <NavLink
              to="/premium"
              className={({ isActive }) =>
                `py-3 px-2 font-medium transition-colors ${
                  isActive
                    ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                    : 'text-gray-500 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
                }`
              }
            >
              👑 Премиум
            </NavLink>
            <NavLink
              to="/friends"
              className={({ isActive }) =>
                `py-3 px-2 font-medium transition-colors ${
                  isActive
                    ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                    : 'text-gray-500 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
                }`
              }
            >
              👥 Друзья
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `py-3 px-2 font-medium transition-colors ${
                  isActive
                    ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                    : 'text-gray-500 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
                }`
              }
            >
              ⚙️ Настройки
            </NavLink>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6 pb-20">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
