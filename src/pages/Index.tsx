import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('home');
  
  const [petStats, setPetStats] = useState({
    hunger: 75,
    happiness: 80,
    health: 90,
    energy: 65,
    coins: 120,
    level: 5,
    xp: 450,
    xpToNext: 600
  });

  const [inventory, setInventory] = useState([
    { id: 1, name: 'Яблоко', type: 'food', effect: 15, price: 10, icon: 'Apple' },
    { id: 2, name: 'Мяч', type: 'toy', effect: 20, price: 25, icon: 'CircleDot' },
  ]);

  const shopItems = [
    { id: 3, name: 'Пицца', type: 'food', effect: 30, price: 35, icon: 'Pizza' },
    { id: 4, name: 'Кость', type: 'toy', effect: 25, price: 40, icon: 'Bone' },
    { id: 5, name: 'Витамины', type: 'health', effect: 40, price: 50, icon: 'Heart' },
  ];

  const [achievements, setAchievements] = useState([
    { id: 1, name: 'Первый друг', description: 'Завести питомца', completed: true, icon: 'Star' },
    { id: 2, name: 'Заботливый', description: 'Покормить 10 раз', completed: true, icon: 'Award' },
    { id: 3, name: 'Богач', description: 'Накопить 500 монет', completed: false, icon: 'Coins' },
  ]);

  const [quests, setQuests] = useState([
    { id: 1, name: 'Покорми питомца 3 раза', progress: 2, goal: 3, reward: 50, icon: 'Target' },
    { id: 2, name: 'Поиграй 5 раз', progress: 3, goal: 5, reward: 75, icon: 'Gamepad2' },
  ]);

  const feedPet = () => {
    if (petStats.hunger >= 100) {
      toast({ title: '😊 Питомец сыт!', description: 'Ему не нужна еда сейчас' });
      return;
    }
    setPetStats(prev => ({
      ...prev,
      hunger: Math.min(100, prev.hunger + 20),
      happiness: Math.min(100, prev.happiness + 5),
      xp: prev.xp + 10
    }));
    toast({ title: '🍎 Ням-ням!', description: '+20 сытости, +5 счастья' });
  };

  const playWithPet = () => {
    if (petStats.energy < 15) {
      toast({ title: '😴 Питомец устал', description: 'Дай ему отдохнуть' });
      return;
    }
    setPetStats(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 25),
      energy: Math.max(0, prev.energy - 15),
      xp: prev.xp + 15
    }));
    toast({ title: '🎮 Весело!', description: '+25 счастья, -15 энергии' });
  };

  const healPet = () => {
    if (petStats.health >= 100) {
      toast({ title: '💪 Питомец здоров!', description: 'Лечение не требуется' });
      return;
    }
    setPetStats(prev => ({
      ...prev,
      health: Math.min(100, prev.health + 30),
      xp: prev.xp + 5
    }));
    toast({ title: '💊 Лечение!', description: '+30 здоровья' });
  };

  const restPet = () => {
    setPetStats(prev => ({
      ...prev,
      energy: Math.min(100, prev.energy + 40),
      xp: prev.xp + 5
    }));
    toast({ title: '😴 Отдых!', description: '+40 энергии' });
  };

  const buyItem = (item: any) => {
    if (petStats.coins < item.price) {
      toast({ title: '❌ Недостаточно монет', variant: 'destructive' });
      return;
    }
    setPetStats(prev => ({ ...prev, coins: prev.coins - item.price }));
    setInventory(prev => [...prev, item]);
    toast({ title: '✅ Куплено!', description: `${item.name} добавлен в инвентарь` });
  };

  const StatBar = ({ label, value, icon }: any) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon name={icon} size={16} className="text-muted-foreground" />
          <span className="font-medium">{label}</span>
        </div>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🐾 Тамагочи</h1>
          <p className="text-gray-600">Заботься о своём виртуальном друге</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <Icon name="Home" size={16} />
              Главная
            </TabsTrigger>
            <TabsTrigger value="pets" className="flex items-center gap-2">
              <Icon name="Dog" size={16} />
              Питомцы
            </TabsTrigger>
            <TabsTrigger value="shop" className="flex items-center gap-2">
              <Icon name="ShoppingBag" size={16} />
              Магазин
            </TabsTrigger>
            <TabsTrigger value="quests" className="flex items-center gap-2">
              <Icon name="Target" size={16} />
              Квесты
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Icon name="Award" size={16} />
              Достижения
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Icon name="User" size={16} />
              Профиль
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              
              <Card className="p-8">
                <div className="text-center space-y-6">
                  <div className="relative inline-block">
                    <div className="text-9xl animate-bounce">🐶</div>
                    <Badge className="absolute -top-2 -right-2 text-lg px-3 py-1">
                      Ур. {petStats.level}
                    </Badge>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Дружок</h2>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Sparkles" size={14} />
                      <span>XP: {petStats.xp} / {petStats.xpToNext}</span>
                    </div>
                    <Progress value={(petStats.xp / petStats.xpToNext) * 100} className="h-1 mt-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={feedPet} className="w-full" variant="default">
                      <Icon name="Apple" size={18} className="mr-2" />
                      Покормить
                    </Button>
                    <Button onClick={playWithPet} className="w-full" variant="secondary">
                      <Icon name="Gamepad2" size={18} className="mr-2" />
                      Играть
                    </Button>
                    <Button onClick={healPet} className="w-full" variant="outline">
                      <Icon name="Heart" size={18} className="mr-2" />
                      Лечить
                    </Button>
                    <Button onClick={restPet} className="w-full" variant="outline">
                      <Icon name="Moon" size={18} className="mr-2" />
                      Отдых
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Характеристики</h3>
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    <Icon name="Coins" size={16} className="mr-1" />
                    {petStats.coins}
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <StatBar label="Сытость" value={petStats.hunger} icon="Apple" />
                  <StatBar label="Счастье" value={petStats.happiness} icon="Smile" />
                  <StatBar label="Здоровье" value={petStats.health} icon="Heart" />
                  <StatBar label="Энергия" value={petStats.energy} icon="Zap" />
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Icon name="Info" size={20} className="text-blue-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 mb-1">Совет дня</p>
                      <p className="text-blue-700">Регулярно играй с питомцем, чтобы он был счастлив!</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="Package" size={24} />
                Инвентарь
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {inventory.map(item => (
                  <div key={item.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <Icon name={item.icon as any} size={32} className="mx-auto mb-2 text-blue-500" />
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">+{item.effect}</p>
                    </div>
                  </div>
                ))}
                {inventory.length === 0 && (
                  <p className="col-span-full text-center text-muted-foreground py-8">
                    Инвентарь пуст
                  </p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="pets" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-6">Твои питомцы</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-6 border-2 border-blue-500 bg-blue-50">
                  <div className="text-center space-y-4">
                    <div className="text-6xl">🐶</div>
                    <div>
                      <h4 className="font-bold text-lg">Дружок</h4>
                      <Badge>Активен</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Уровень {petStats.level}</p>
                  </div>
                </Card>
                
                <Card className="p-6 border-2 border-dashed hover:border-blue-500 transition-colors cursor-pointer">
                  <div className="text-center space-y-4 text-muted-foreground">
                    <Icon name="Plus" size={48} className="mx-auto" />
                    <p className="font-medium">Добавить питомца</p>
                    <p className="text-xs">Открывается на 10 уровне</p>
                  </div>
                </Card>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="shop" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Icon name="ShoppingBag" size={28} />
                  Магазин
                </h3>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  <Icon name="Coins" size={18} className="mr-2" />
                  {petStats.coins}
                </Badge>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                {shopItems.map(item => (
                  <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="text-center space-y-4">
                      <Icon name={item.icon as any} size={48} className="mx-auto text-blue-500" />
                      <div>
                        <h4 className="font-bold">{item.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Эффект: +{item.effect}
                        </p>
                      </div>
                      <Button 
                        onClick={() => buyItem(item)} 
                        className="w-full"
                        variant={petStats.coins >= item.price ? "default" : "secondary"}
                        disabled={petStats.coins < item.price}
                      >
                        <Icon name="Coins" size={16} className="mr-2" />
                        {item.price}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="quests" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Icon name="Target" size={28} />
                Активные квесты
              </h3>
              
              <div className="space-y-4">
                {quests.map(quest => (
                  <Card key={quest.id} className="p-5 border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Icon name={quest.icon as any} size={24} className="text-blue-500" />
                        <div>
                          <h4 className="font-bold">{quest.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Награда: {quest.reward} монет
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {quest.progress}/{quest.goal}
                      </Badge>
                    </div>
                    <Progress value={(quest.progress / quest.goal) * 100} className="h-2" />
                  </Card>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🎉</div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-1">Ежедневный бонус</h4>
                  <p className="text-sm text-muted-foreground">Заходи каждый день и получай награды!</p>
                </div>
                <Button>Получить</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Icon name="Award" size={28} />
                Достижения
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {achievements.map(ach => (
                  <Card 
                    key={ach.id} 
                    className={`p-5 ${ach.completed ? 'bg-green-50 border-green-200' : 'opacity-60'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${ach.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <Icon 
                          name={ach.icon as any} 
                          size={24} 
                          className={ach.completed ? 'text-green-600' : 'text-gray-400'} 
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold">{ach.name}</h4>
                        <p className="text-sm text-muted-foreground">{ach.description}</p>
                      </div>
                      {ach.completed && (
                        <Icon name="Check" size={24} className="text-green-600" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="User" size={28} />
                  Профиль
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      И
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Игрок</h4>
                      <p className="text-sm text-muted-foreground">Уровень {petStats.level}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Всего монет</span>
                      <span className="font-bold">{petStats.coins}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Питомцев</span>
                      <span className="font-bold">1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Достижений</span>
                      <span className="font-bold">{achievements.filter(a => a.completed).length}/{achievements.length}</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="BarChart3" size={28} />
                  Статистика
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Взаимодействий</span>
                      <span className="text-2xl font-bold text-blue-600">247</span>
                    </div>
                    <p className="text-xs text-muted-foreground">За все время</p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Дней подряд</span>
                      <span className="text-2xl font-bold text-purple-600">12</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Максимальная серия</p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Уровень счастья</span>
                      <span className="text-2xl font-bold text-green-600">{petStats.happiness}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Средний показатель</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="Trophy" size={24} />
                Рейтинг игроков
              </h3>
              <div className="space-y-3">
                {[
                  { rank: 1, name: 'Мастер', level: 15, score: 2500, isYou: false },
                  { rank: 2, name: 'ПроГеймер', level: 12, score: 1800, isYou: false },
                  { rank: 3, name: 'Игрок (Вы)', level: petStats.level, score: 950, isYou: true },
                  { rank: 4, name: 'Новичок', level: 3, score: 450, isYou: false },
                ].map(player => (
                  <div 
                    key={player.rank} 
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      player.isYou ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      player.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                      player.rank === 2 ? 'bg-gray-300 text-gray-700' :
                      player.rank === 3 ? 'bg-orange-400 text-orange-900' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {player.rank}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">{player.name}</p>
                      <p className="text-sm text-muted-foreground">Уровень {player.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{player.score}</p>
                      <p className="text-xs text-muted-foreground">очков</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
