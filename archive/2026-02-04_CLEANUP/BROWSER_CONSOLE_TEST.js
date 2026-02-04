// Copy and paste this entire block into your browser console (F12)
// This will test if Supabase is properly configured and data exists

(async () => {
  console.log('🧪 Starting Supabase Diagnostic Test...\n');

  try {
    // Import Supabase from window (if available)
    const module = await import('../../lib/supabase.js');
    const { supabase } = module;

    if (!supabase) {
      console.error('❌ Supabase client not found!');
      return;
    }

    console.log('✅ Supabase client loaded successfully\n');

    // Test 1: Check environment variables
    console.log('📋 Environment Configuration:');
    console.log('  VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('  VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
    console.log('');

    // Test 2: Try to fetch invoices
    console.log('🔍 Testing Invoice Data Fetch:');
    const { data: invoices, error: invError } = await supabase
      .from('invoices')
      .select('*')
      .limit(5);

    if (invError) {
      console.error('  ❌ Error fetching invoices:');
      console.error('     Code:', invError.code);
      console.error('     Message:', invError.message);
      console.error('     Details:', invError.details);
    } else {
      console.log(`  ✅ Successfully fetched invoices (${invoices?.length || 0} records)`);
      if (invoices && invoices.length > 0) {
        console.log('     Sample:', invoices[0]);
      }
    }
    console.log('');

    // Test 3: Try to fetch documents
    console.log('🔍 Testing Document Data Fetch:');
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('*')
      .limit(5);

    if (docError) {
      console.error('  ❌ Error fetching documents:');
      console.error('     Code:', docError.code);
      console.error('     Message:', docError.message);
      console.error('     Details:', docError.details);
    } else {
      console.log(`  ✅ Successfully fetched documents (${documents?.length || 0} records)`);
      if (documents && documents.length > 0) {
        console.log('     Sample:', documents[0]);
      }
    }
    console.log('');

    // Test 4: Check table row counts
    console.log('📊 Table Statistics:');
    const { count: invCount, error: invCountError } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true });

    const { count: docCount, error: docCountError } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });

    console.log(`  Invoices: ${invCountError ? '❌ Error' : '✅ ' + invCount + ' rows'}`);
    console.log(`  Documents: ${docCountError ? '❌ Error' : '✅ ' + docCount + ' rows'}`);
    console.log('');

    console.log('✅ Diagnostic test complete!');

  } catch (err) {
    console.error('💥 Diagnostic test failed:');
    console.error(err);
  }
})();
