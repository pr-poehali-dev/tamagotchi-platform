import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для торговли предметами между игроками'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            user_id = params.get('user_id')
            
            cur.execute(
                """
                SELECT t.id, t.item_name, t.item_type, t.effect, t.price, t.status, 
                       u.username as seller_name, t.seller_id
                FROM trade_offers t
                JOIN users u ON t.seller_id = u.id
                WHERE t.status = 'active' AND t.seller_id != %s
                ORDER BY t.created_at DESC
                LIMIT 20
                """,
                (user_id or 0,)
            )
            offers = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'offers': [
                        {
                            'id': o[0],
                            'item_name': o[1],
                            'item_type': o[2],
                            'effect': o[3],
                            'price': o[4],
                            'status': o[5],
                            'seller_name': o[6],
                            'seller_id': o[7]
                        } for o in offers
                    ]
                })
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'create_offer':
                seller_id = body.get('user_id')
                item_name = body.get('item_name')
                item_type = body.get('item_type')
                effect = body.get('effect')
                price = body.get('price')
                
                if not all([seller_id, item_name, price]):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Недостаточно данных'})
                    }
                
                cur.execute(
                    "SELECT quantity FROM inventory WHERE user_id = %s AND item_name = %s",
                    (seller_id, item_name)
                )
                inv = cur.fetchone()
                
                if not inv or inv[0] < 1:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Предмет не найден в инвентаре'})
                    }
                
                cur.execute(
                    "UPDATE inventory SET quantity = quantity - 1 WHERE user_id = %s AND item_name = %s",
                    (seller_id, item_name)
                )
                
                cur.execute(
                    "INSERT INTO trade_offers (seller_id, item_name, item_type, effect, price) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                    (seller_id, item_name, item_type, effect, price)
                )
                offer_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'offer_id': offer_id})
                }
            
            elif action == 'buy':
                buyer_id = body.get('user_id')
                offer_id = body.get('offer_id')
                
                if not buyer_id or not offer_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Недостаточно данных'})
                    }
                
                cur.execute(
                    "SELECT seller_id, item_name, item_type, effect, price FROM trade_offers WHERE id = %s AND status = 'active'",
                    (offer_id,)
                )
                offer = cur.fetchone()
                
                if not offer:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Предложение не найдено'})
                    }
                
                cur.execute("SELECT coins FROM users WHERE id = %s", (buyer_id,))
                buyer_coins = cur.fetchone()[0]
                
                if buyer_coins < offer[4]:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Недостаточно монет'})
                    }
                
                cur.execute("UPDATE users SET coins = coins - %s WHERE id = %s", (offer[4], buyer_id))
                cur.execute("UPDATE users SET coins = coins + %s WHERE id = %s", (offer[4], offer[0]))
                
                cur.execute(
                    "INSERT INTO inventory (user_id, item_name, item_type, effect) VALUES (%s, %s, %s, %s)",
                    (buyer_id, offer[1], offer[2], offer[3])
                )
                
                cur.execute(
                    "UPDATE trade_offers SET status = 'completed', buyer_id = %s, completed_at = %s WHERE id = %s",
                    (buyer_id, datetime.now(), offer_id)
                )
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'message': 'Покупка совершена'})
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
