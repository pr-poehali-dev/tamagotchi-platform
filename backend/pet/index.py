import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для управления питомцами и их характеристиками'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': ''
        }
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            user_id = params.get('user_id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id обязателен'})
                }
            
            cur.execute(
                "SELECT id, name, pet_type, level, xp, hunger, happiness, health, energy FROM pets WHERE user_id = %s",
                (user_id,)
            )
            pet = cur.fetchone()
            
            if not pet:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Питомец не найден'})
                }
            
            cur.execute("SELECT level, coins, xp FROM users WHERE id = %s", (user_id,))
            user = cur.fetchone()
            
            cur.execute(
                "SELECT item_name, item_type, effect, quantity FROM inventory WHERE user_id = %s",
                (user_id,)
            )
            inventory = cur.fetchall()
            
            cur.execute(
                "SELECT achievement_name, completed FROM user_achievements WHERE user_id = %s",
                (user_id,)
            )
            achievements = cur.fetchall()
            
            cur.execute(
                "SELECT quest_name, progress, goal, reward, completed FROM user_quests WHERE user_id = %s",
                (user_id,)
            )
            quests = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'pet': {
                        'id': pet[0],
                        'name': pet[1],
                        'type': pet[2],
                        'level': pet[3],
                        'xp': pet[4],
                        'hunger': pet[5],
                        'happiness': pet[6],
                        'health': pet[7],
                        'energy': pet[8]
                    },
                    'user': {
                        'level': user[0],
                        'coins': user[1],
                        'xp': user[2]
                    },
                    'inventory': [{'name': i[0], 'type': i[1], 'effect': i[2], 'quantity': i[3]} for i in inventory],
                    'achievements': [{'name': a[0], 'completed': a[1]} for a in achievements],
                    'quests': [{'name': q[0], 'progress': q[1], 'goal': q[2], 'reward': q[3], 'completed': q[4]} for q in quests]
                })
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            user_id = body.get('user_id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id обязателен'})
                }
            
            if action == 'feed':
                cur.execute(
                    "UPDATE pets SET hunger = LEAST(100, hunger + 20), happiness = LEAST(100, happiness + 5), xp = xp + 10, last_fed = %s WHERE user_id = %s RETURNING hunger, happiness, xp",
                    (datetime.now(), user_id)
                )
                result = cur.fetchone()
                
                cur.execute(
                    "UPDATE user_quests SET progress = LEAST(progress + 1, goal) WHERE user_id = %s AND quest_name = %s AND completed = FALSE",
                    (user_id, 'Покорми питомца 3 раза')
                )
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'hunger': result[0], 'happiness': result[1], 'xp': result[2]})
                }
            
            elif action == 'play':
                cur.execute(
                    "UPDATE pets SET happiness = LEAST(100, happiness + 25), energy = GREATEST(0, energy - 15), xp = xp + 15, last_played = %s WHERE user_id = %s RETURNING happiness, energy, xp",
                    (datetime.now(), user_id)
                )
                result = cur.fetchone()
                
                cur.execute(
                    "UPDATE user_quests SET progress = LEAST(progress + 1, goal) WHERE user_id = %s AND quest_name = %s AND completed = FALSE",
                    (user_id, 'Поиграй 5 раз')
                )
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'happiness': result[0], 'energy': result[1], 'xp': result[2]})
                }
            
            elif action == 'heal':
                cur.execute(
                    "UPDATE pets SET health = LEAST(100, health + 30), xp = xp + 5 WHERE user_id = %s RETURNING health, xp",
                    (user_id,)
                )
                result = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'health': result[0], 'xp': result[1]})
                }
            
            elif action == 'rest':
                cur.execute(
                    "UPDATE pets SET energy = LEAST(100, energy + 40), xp = xp + 5 WHERE user_id = %s RETURNING energy, xp",
                    (user_id,)
                )
                result = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'energy': result[0], 'xp': result[1]})
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
