// Quick script to reset user usage limit for testing
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://cpuotzkxnaitiwdsrzgd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwdW90emt4bmFpdGl3ZHNyemdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzkyODg3MSwiZXhwIjoyMDY5NTA0ODcxfQ.m2VnZ0giB-NnS-t66ZvrqbO8GsQLNheOlEThAbB2zr8'
)

async function resetUserLimit() {
  const email = 'konrad11811@wp.pl'

  console.log('🔍 Looking for user:', email)

  // Check current state
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (fetchError) {
    console.error('❌ Error fetching user:', fetchError)
    return
  }

  console.log('👤 Current user state:', {
    email: user.email,
    plan: user.plan,
    usage_count: user.usage_count,
    usage_limit: user.usage_limit,
    expires_at: user.expires_at
  })

  // Reset usage count
  const { data: updated, error: updateError } = await supabase
    .from('users')
    .update({ usage_count: 0 })
    .eq('email', email)
    .select()

  if (updateError) {
    console.error('❌ Error updating user:', updateError)
    return
  }

  console.log('✅ User limit reset!')
  console.log('📊 New state:', {
    email: updated[0].email,
    plan: updated[0].plan,
    usage_count: updated[0].usage_count,
    usage_limit: updated[0].usage_limit,
    remaining: updated[0].usage_limit - updated[0].usage_count
  })
}

resetUserLimit()
