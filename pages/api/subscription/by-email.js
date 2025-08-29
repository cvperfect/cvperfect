import { supabaseAdmin } from '../../../utils/supabaseAdmin';
const mk = () => new Date().toISOString().slice(0,7);

export default async function handler(req,res){
  const email=(req.query.email||'').trim().toLowerCase();
  if(!email) return res.status(400).json({error:'Missing email'});

  const { data:user, error:uErr } = await supabaseAdmin
    .from('users').select('id,plan').eq('email',email).single();
  if(uErr || !user) return res.status(404).json({error:'User not found'});

  const { data:uc } = await supabaseAdmin
    .from('user_credits')
    .select('total_credits,used_credits,month_year')
    .eq('user_id',user.id).eq('month_year',mk()).maybeSingle();

  const total = user.plan==='premium'?25 : user.plan==='gold'?10 : 1;
  res.json({ plan:user.plan, monthlyCredits: uc
    ? { total:uc.total_credits, used:uc.used_credits, monthYear:uc.month_year }
    : { total, used:0, monthYear:mk() }});
}
