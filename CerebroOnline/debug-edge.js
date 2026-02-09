
// using global fetch
async function run() {
  const url = 'https://kjdlygrfhaotbxaatoti.supabase.co/functions/v1/classify-entry';
  const headers = { 
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZGx5Z3JmaGFvdGJ4YWF0b3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0ODAyMjAsImV4cCI6MjA4NjA1NjIyMH0.l9jWPJElfEaAMA20FnhmmuiPs6BEh1bMJhVCv2wj9qk',
    'Content-Type': 'application/json'
  };
  const body = JSON.stringify({ content: 'Estudar 2h de biologia' });

  try {
    const response = await fetch(url, { method: 'POST', headers, body });
    const text = await response.text();
    console.log('Status:', response.status);
    try {
        console.log('Body:', JSON.stringify(JSON.parse(text), null, 2));
    } catch (e) {
        console.log('Body (Text):', text);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

run();
