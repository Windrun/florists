import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { User } from '../types';

interface ProfileSettingsProps {
  user: User;
  onRefresh: () => void;
}

const AVATAR_OPTIONS = ['🌸', '🌺', '🌻', '🌹', '🌷', '🌱', '🍀', '🌈', '⭐', '💎'];

const ProfileSettings = ({ user, onRefresh }: ProfileSettingsProps) => {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user.photoURL || '🌸');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setDisplayName(user.displayName || '');
    setSelectedAvatar(user.photoURL || '🌸');
  }, [user]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      setMessage({ type: 'error', text: 'Введите имя' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: displayName.trim(),
        photoURL: selectedAvatar,
      });
      
      setMessage({ type: 'success', text: 'Сохранено!' });
      onRefresh();
      
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка сохранения' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-2xl">⚙️</div>
        <div>
          <div className="font-bold text-gray-800 dark:text-gray-200">Настройки профиля</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Измените ваш никнейм и аватар</div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-4xl shadow-lg">
          {selectedAvatar}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ваше имя
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Введите имя"
            maxLength={20}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Выберите аватар
        </label>
        <div className="flex flex-wrap gap-2">
          {AVATAR_OPTIONS.map((avatar) => (
            <button
              key={avatar}
              onClick={() => setSelectedAvatar(avatar)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                selectedAvatar === avatar
                  ? 'bg-green-500 text-white shadow-lg scale-110'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {avatar}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{darkMode ? '🌙' : '☀️'}</span>
            <span className="font-medium dark:text-gray-200">Тёмная тема</span>
          </div>
          <button
            onClick={handleDarkModeToggle}
            className={`w-12 h-6 rounded-full transition-colors ${
              darkMode ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
              darkMode ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-3 p-2 rounded-lg text-sm text-center ${
          message.type === 'success' 
            ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' 
            : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 shadow-md disabled:opacity-50"
      >
        {saving ? 'Сохранение...' : 'Сохранить'}
      </button>
    </div>
  );
};

export default ProfileSettings;
