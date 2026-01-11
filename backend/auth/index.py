import json
import os
import hashlib
import secrets
import psycopg2
from datetime import datetime, timedelta

def handler(event: dict, context) -> dict:
    '''API для регистрации и авторизации пользователей'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'register':
                email = body.get('email')
                password = body.get('password')
                username = body.get('username', email.split('@')[0])
                
                if not email or not password:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Email и пароль обязательны'})
                    }
                
                password_hash = hashlib.sha256(password.encode()).hexdigest()
                
                try:
                    cur.execute(
                        "INSERT INTO users (email, password_hash, username) VALUES (%s, %s, %s) RETURNING id, email, username, level, coins, xp",
                        (email, password_hash, username)
                    )
                    user_data = cur.fetchone()
                    
                    cur.execute(
                        "INSERT INTO pets (user_id, name, pet_type, level, xp, hunger, happiness, health, energy) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                        (user_data[0], 'Дружок', 'dog', 1, 0, 75, 80, 90, 65)
                    )
                    
                    achievements = ['Первый друг', 'Заботливый', 'Богач']
                    for ach in achievements:
                        completed = ach == 'Первый друг'
                        cur.execute(
                            "INSERT INTO user_achievements (user_id, achievement_name, completed, completed_at) VALUES (%s, %s, %s, %s)",
                            (user_data[0], ach, completed, datetime.now() if completed else None)
                        )
                    
                    cur.execute(
                        "INSERT INTO user_quests (user_id, quest_name, progress, goal, reward) VALUES (%s, %s, %s, %s, %s)",
                        (user_data[0], 'Покорми питомца 3 раза', 0, 3, 50)
                    )
                    cur.execute(
                        "INSERT INTO user_quests (user_id, quest_name, progress, goal, reward) VALUES (%s, %s, %s, %s, %s)",
                        (user_data[0], 'Поиграй 5 раз', 0, 5, 75)
                    )
                    
                    conn.commit()
                    
                    token = secrets.token_urlsafe(32)
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'success': True,
                            'token': token,
                            'user': {
                                'id': user_data[0],
                                'email': user_data[1],
                                'username': user_data[2],
                                'level': user_data[3],
                                'coins': user_data[4],
                                'xp': user_data[5]
                            }
                        })
                    }
                except psycopg2.IntegrityError:
                    conn.rollback()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Пользователь с таким email уже существует'})
                    }
            
            elif action == 'login':
                email = body.get('email')
                password = body.get('password')
                
                if not email or not password:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Email и пароль обязательны'})
                    }
                
                password_hash = hashlib.sha256(password.encode()).hexdigest()
                
                cur.execute(
                    "SELECT id, email, username, level, coins, xp, password_hash FROM users WHERE email = %s",
                    (email,)
                )
                user = cur.fetchone()
                
                if not user or user[6] != password_hash:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Неверный email или пароль'})
                    }
                
                cur.execute("UPDATE users SET last_login = %s WHERE id = %s", (datetime.now(), user[0]))
                conn.commit()
                
                token = secrets.token_urlsafe(32)
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'token': token,
                        'user': {
                            'id': user[0],
                            'email': user[1],
                            'username': user[2],
                            'level': user[3],
                            'coins': user[4],
                            'xp': user[5]
                        }
                    })
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'})
        }
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
