-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    level INTEGER DEFAULT 1,
    coins INTEGER DEFAULT 100,
    xp INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы питомцев
CREATE TABLE IF NOT EXISTS pets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100) NOT NULL DEFAULT 'Дружок',
    pet_type VARCHAR(50) DEFAULT 'dog',
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    hunger INTEGER DEFAULT 75,
    happiness INTEGER DEFAULT 80,
    health INTEGER DEFAULT 90,
    energy INTEGER DEFAULT 65,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_fed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы инвентаря
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    item_name VARCHAR(100) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    effect INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы достижений пользователей
CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    achievement_name VARCHAR(100) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    UNIQUE(user_id, achievement_name)
);

-- Создание таблицы квестов
CREATE TABLE IF NOT EXISTS user_quests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    quest_name VARCHAR(200) NOT NULL,
    progress INTEGER DEFAULT 0,
    goal INTEGER NOT NULL,
    reward INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы торговых предложений
CREATE TABLE IF NOT EXISTS trade_offers (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES users(id),
    buyer_id INTEGER,
    item_name VARCHAR(100) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    effect INTEGER NOT NULL,
    price INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Создание таблицы событий
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(200) NOT NULL,
    description TEXT,
    reward_type VARCHAR(50),
    reward_amount INTEGER,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_offers_seller ON trade_offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_trade_offers_status ON trade_offers(status);
