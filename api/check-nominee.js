export default async function handler(req, res) {
  const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN;
  const LIST_ID = process.env.HUBSPOT_LIST_ID;
  
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;

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
    const contact = searchData.results?.[0];
    if (!contact) return res.json({ valid: false });

    const contactId = contact.id;

    // Check list membership
    const listResponse = await fetch(`https://api.hubapi.com/contacts/v1/lists/${LIST_ID}/contacts/vids`, {
      headers: { 'Authorization': `Bearer ${HUBSPOT_TOKEN}` }
    });

    const listData = await listResponse.json();
    const isInList = listData.vids.includes(parseInt(contactId));

    return res.json({ valid: isInList });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ valid: false, error: 'Server error' });
  }
}
