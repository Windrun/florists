import { Flower } from '../types';

interface FriendHelpProps {
  flowers: Flower[];
  onHelp: (flowerId: string, ownerId: string) => void;
}

const FriendHelp = ({ flowers, onHelp }: FriendHelpProps) => {
  const readyToHelpFlowers = flowers.filter(
    (f) => !f.harvestedAt && f.helperIds.length < 3
  );

  return (
    <div className="p-4 bg-blue-50 rounded-xl">
      <h3 className="font-semibold text-blue-800 mb-3">
        💧 Помочь друзьям
      </h3>
      {readyToHelpFlowers.length > 0 ? (
        <div className="space-y-2">
          {readyToHelpFlowers.slice(0, 5).map((flower) => (
            <div
              key={flower.id}
              className="flex items-center justify-between bg-white p-3 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span>🌸</span>
                <span className="text-sm">{flower.type}</span>
              </div>
              <button
                onClick={() => onHelp(flower.id, flower.ownerId)}
                className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
              >
                Полить +1🪙
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Нет цветов друзей для помощи
        </p>
      )}
    </div>
  );
};

export default FriendHelp;
