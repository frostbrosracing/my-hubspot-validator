export default async function handler(req, res) {
  const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN;

  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;
  if (!email) return res.status(400).json({ valid: false, error: 'Missing email' });

  try {
    // Search for the contact by email and request the `aces_eligible` property
    const searchResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filterGroups: [{
          filters: [{ propertyName: 'email', operator: 'EQ', value: email }]
        }],
        properties: ['aces_eligible']
      })
    });

    const searchData = await searchResponse.json();
    console.log('Search response:', JSON.stringify(searchData, null, 2));

    const contact = searchData.results?.[0];
    if (!contact) {
      return res.json({ valid: false, error: 'Contact not found' });
    }

    const isEligible = contact.properties?.aces_eligible === 'true';

    return res.json({ valid: isEligible });
  } catch (err) {
    console.error('Error in check-nominee:', err);
    return res.status(500).json({ valid: false, error: 'Server error' });
  }
}
