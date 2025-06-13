// app/api/auth/complete-setup/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  const formData = await request.formData()
  const organizationName = formData.get('organizationName') as string
  
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return redirect('/login')
  }

  try {
    // Create organization
    const orgSlug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: organizationName,
        slug: orgSlug,
        email: user.email,
        plan_type: 'free',
        client_count: 0
      })
      .select()
      .single()

    if (orgError) {
      console.error('Organization creation error:', orgError)
      throw orgError
    }

    // Update user with organization
    const { error: updateError } = await supabase
      .from('users')
      .update({
        organization_id: org.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('User update error:', updateError)
      // Rollback - delete organization
      await supabase.from('organizations').delete().eq('id', org.id)
      throw updateError
    }

    // Success - redirect to dashboard
    return redirect('/dashboard')
    
  } catch (error) {
    console.error('Complete setup error:', error)
    return redirect('/error')
  }
}