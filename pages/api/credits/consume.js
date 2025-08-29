import { supabaseAdmin } from '../../../utils/supabaseAdmin';
const mk=()=>new Date().toISOString().slice(0,7);

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).end();
  const email=(req.body.email||'').trim().toLowerCase();
  if(!email) return res.status(400).json({error:'Missing email'});

  const { data:user }=await supabaseAdmin
    .from('users').select('id,plan').eq('email',email).single();
  if(!user) return res.status(404).json({error:'User not found'});

  let { data:uc }=await supabaseAdmin
    .from('user_credits')
    .select('id,total_credits,used_credits')
    .eq('user_id',user.id).eq('month_year',mk()).maybeSingle();

  if(!uc){
    const total=user.plan==='premium'?25:user.plan==='gold'?10:1;
    const ins=await supabaseAdmin.from('user_credits')
      .insert({user_id:user.id,month_year:mk(),total_credits:total,used_credits:0})
      .select().single();
    uc = ins.data;
  }

  if(uc.used_credits>=uc.total_credits)
    return res.status(402).json({error:'Monthly credit limit exceeded'});

  const upd=await supabaseAdmin.from('user_credits')
    .update({used_credits: uc.used_credits+1})
    .eq('id',uc.id).eq('used_credits',uc.used_credits)
    .select().single();

  if(!upd.data) return res.status(409).json({error:'Retry consume'});
  res.json({ remaining: upd.data.total_credits - upd.data.used_credits, total: upd.data.total_credits });
}
