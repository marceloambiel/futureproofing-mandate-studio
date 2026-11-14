import {Link} from 'react-router-dom'
import {buttonVariants} from '@/components/ui/button'
export function NotFound(){return <main className="not-found"><img src="/brand/mandate-studio.svg" alt="Mandate Studio" width="205" height="26"/><h1>We couldn't find that page</h1><p>The address may be incomplete. Return to the current sample assignment or the website.</p><div className="hero-actions"><Link className={buttonVariants()} to="/workspace/assignment">Return to assignment</Link><Link className={buttonVariants({variant:'outline'})} to="/">Back to homepage</Link></div></main>}
