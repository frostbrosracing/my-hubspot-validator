export default async function handler(req, res) {
  const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN;
  const LIST_ID = process.env.HUBSPOT_LIST_ID;

  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;
  if (!email) return res.status(400).json({ valid: false, error: 'Missing email' });

  try {
    // Search for the contact by email
    const searchResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filterGroups: [{
          filters: [{ propertyName: 'email', operator: 'EQ', value: email }]
        }]
      })
    });

    const searchData = await searchResponse.json();
    console.log('Search response:', JSON.stringify(searchData, null, 2));

    const contact = searchData.results?.[0];
    if (!contact) {
      return res.json({ valid: false, error: 'Contact not found' });
    }

    const contactId = contact.id;
    console.log('Contact ID:', contactId);

    // Check list membership
    const listResponse = await fetch(`https://api.hubapi.com/contacts/v1/lists/${LIST_ID}/contacts/vids`, {
      headers: { 'Authorization': `Bearer ${HUBSPOT_TOKEN}` }
    });

    const listData = await listResponse.json();
    console.log('List response:', JSON.stringify(listData, null, 2));

    const isInList = listData.vids?.includes(parseInt(contactId));

    return res.json({ valid: isInList });
  } catch (err) {
    console.error('Error in check-nominee:', err);
    return res.status(500).json({ valid: false, error: 'Server error' });
  }
}
