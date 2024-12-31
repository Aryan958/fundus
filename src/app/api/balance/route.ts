import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js'
import 'dotenv/config'

export async function POST(request: Request) {
  const secretKey = process.env.SECRET_KEY;
  const providedKey = request.headers.get('x-secret-key');

  if (providedKey !== secretKey) {
    return new Response('Unauthorized', { status: 401 });
  }

  const connection = new Connection(clusterApiUrl('devnet'));
  const accountPubKey = new PublicKey(
    '6FP1Q5VD5kibWmwXaPrqMgsxSDnLr1wP3UhtvDkz6Net'
  );

  try {
    const accountInfo = await connection.getAccountInfo(accountPubKey);
    if (accountInfo) {
      return new Response(JSON.stringify(accountInfo), { status: 200 });
    } else {
      return new Response('Account not found', { status: 404 });
    }
  } catch (error) {
    return new Response(`Error: ${error}`, { status: 500 });
  }
}
