/* Vercel（nq-repo.vercel.app）のベーシック認証。画面設計・プロトタイプ・/react/ ・画像まで、全部のリクエストに掛かる。
 * ユーザー名とパスワードは Vercel の環境変数 BASIC_AUTH_USER / BASIC_AUTH_PASSWORD で変えられる。
 * 無ければ React の BasicAuth（react-src/src/components/BasicAuth.tsx）と同じものを使う。
 * 手元の node .claude/serve.cjs には掛からない。 */
export const config = { matcher: '/:path*' };

const USER = process.env.BASIC_AUTH_USER || 'nq-repo';
const PASS = process.env.BASIC_AUTH_PASSWORD || 'nq_8888@';

export default function middleware(request) {
  const auth = request.headers.get('authorization') || '';
  const [scheme, encoded] = auth.split(' ');
  if (scheme === 'Basic' && encoded) {
    try {
      const decoded = atob(encoded);
      const i = decoded.indexOf(':');
      if (decoded.slice(0, i) === USER && decoded.slice(i + 1) === PASS) return; /* そのまま通す */
    } catch {
      /* 壊れたヘッダーは認証失敗として扱う */
    }
  }
  return new Response('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="NQrepo", charset="UTF-8"' },
  });
}
