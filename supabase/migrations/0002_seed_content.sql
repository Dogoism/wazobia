-- ============================================================================
-- YARN content seed — GENERATED FILE, do not edit by hand.
-- Regenerate with: npm run seed:generate  (source: lib/data/concepts.ts)
--
-- Language-data rules (AGENTS.md) apply to every row here: attested
-- standard-variety phrases only, diacritics preserved, no invented dialect
-- forms, AI suggestions never verified. votes_count is intentionally 0.
-- ============================================================================

insert into contributors (id, user_id, display_name, kind, is_reviewer) values
  ('11111111-1111-4111-8111-111111111111', null, 'YARN editorial seed', 'seed', false),
  ('22222222-2222-4222-8222-222222222222', null, 'AI suggestion (unreviewed)', 'ai', false);

insert into sources (id, title, url, is_placeholder) values
  ('8c7174e9-2cd0-f2e3-3198-64a03a57c1ad', 'Wiktionary: long time no see', 'https://en.wiktionary.org/wiki/long_time_no_see', false),
  ('e14b5fd4-b6bd-b8d4-d760-1f8b3803085b', 'Wikivoyage: Hausa phrasebook', 'https://en.wikivoyage.org/wiki/Hausa_phrasebook', false),
  ('9eba7175-4095-0676-f839-746b8e32e856', 'Seed data — primary citation pending', null, true),
  ('f2a09295-ba6d-41d2-263c-007f9116371f', 'Wiktionary: good morning', 'https://en.wiktionary.org/wiki/good_morning', false),
  ('f44fa9c5-c670-f1ec-a9b9-6b99c83c74c2', 'Wikivoyage: Igbo phrasebook', 'https://en.wikivoyage.org/wiki/Igbo_phrasebook', false),
  ('f3ccad2d-1007-8bc7-954b-538705264115', 'Wikivoyage: Yoruba phrasebook', 'https://en.wikivoyage.org/wiki/Yoruba_phrasebook', false),
  ('aa785a93-00b2-969a-dab7-c6baf99e3b38', 'Wiktionary: welcome', 'https://en.wiktionary.org/wiki/welcome', false),
  ('7c182463-ad9f-f680-2162-ee4fbc18b9b9', 'Wiktionary: thank you', 'https://en.wiktionary.org/wiki/thank_you', false),
  ('ddce2642-988d-7ef6-bc2a-e85a72a843e9', 'Wiktionary: well done', 'https://en.wiktionary.org/wiki/well_done', false),
  ('8ee18924-d82f-8f75-2208-e7b7204a1110', 'Wiktionary: sorry', 'https://en.wiktionary.org/wiki/sorry', false);

insert into concepts (id, slug, title, description, category, search_terms, position) values
  ('5ccbb1a6-0b51-b989-e0f2-22333f0e9ad0', 'long-time-no-see', 'Greeting someone you haven''t seen in a while', 'What you say when you run into a person after a noticeable absence — warmth plus a nod to the time that has passed.', 'greetings', array['long time no see', 'it''s been a while', 'it has been long', 'haven''t seen you in ages', 'greet someone you haven''t seen', 'where have you been']::text[], 0),
  ('c7215d73-7e92-2346-152f-0af87d15332b', 'good-morning', 'Greeting someone in the morning', 'The first greeting of the day. In all three Nigerian languages the traditional form asks after the night rather than describing the morning.', 'greetings', array['good morning', 'morning greeting', 'greet in the morning']::text[], 1),
  ('f75e8a1b-a57e-c8c8-dd2b-42507346efb6', 'welcoming-someone', 'Welcoming someone who has just arrived', 'Said to a guest or a person returning from a journey, the market, or work — an arrival is acknowledged out loud.', 'greetings', array['welcome', 'welcome back', 'greet a guest', 'receive a visitor', 'you are welcome']::text[], 2),
  ('3c909d45-cfac-4f6a-edc0-08657a04f8ce', 'thanking-someone', 'Thanking someone', 'Expressing gratitude. Register matters: Yorùbá in particular changes form depending on the age or status of the person being thanked.', 'gratitude', array['thank you', 'thanks', 'show gratitude', 'grateful']::text[], 3),
  ('c96a45f9-707a-4525-dc3c-dafb9e789c4d', 'acknowledging-work', 'Acknowledging someone at work', 'A greeting offered to a person in the middle of labour. Common across Nigerian cultures; Nigerian English carries it as “well done”, said without irony.', 'encouragement', array['well done', 'well done at work', 'greet someone working', 'more grease to your elbow', 'keep it up']::text[], 4),
  ('6e7c985c-aada-469e-93ad-2582b8cd2f71', 'expressing-sympathy', 'Expressing sympathy', 'What you say when something bad — large or small — happens to someone. In Nigerian usage the speaker need not be at fault to say sorry.', 'sympathy', array['sorry', 'so sorry', 'sympathy', 'condolence', 'take heart', 'commiserate']::text[], 5);

insert into expressions (id, concept_id, language_code, variant_id, text, literal_meaning, natural_meaning, usage_note, register, pronunciation_note, position, contributor_id, verification_status, dispute_note, votes_count) values
  ('124a6861-0f75-82c8-83a0-8437decc0d51', '5ccbb1a6-0b51-b989-e0f2-22333f0e9ad0', 'en', 'en-standard', 'Long time no see', null, 'It has been a long time since we last met.', 'Casual and friendly. “It’s been a while” is the slightly more neutral alternative.', 'casual', null, 0, '11111111-1111-4111-8111-111111111111', 'verified', null, 0),
  ('59e29322-711e-ad65-9eb4-8c7f72f26fdf', '5ccbb1a6-0b51-b989-e0f2-22333f0e9ad0', 'ha', 'ha-standard', 'Kwana biyu', 'Two days', 'It’s been a while — long time no see.', 'The “two days” are figurative: any noticeable absence counts. A common reply is “Kwana biyu ke nan” — “indeed, it has been a while”.', 'casual', null, 1, '11111111-1111-4111-8111-111111111111', 'verified', null, 0),
  ('c780e98c-316f-6af6-8f6d-35d2b2f2964e', '5ccbb1a6-0b51-b989-e0f2-22333f0e9ad0', 'yo', 'yo-standard', 'Ẹ kú ọjọ́ mẹ́ta', 'Greetings on three days', 'It’s been a while — long time no see.', 'Built on the Yorùbá “kú …” greeting pattern; “three days” stands in for any long absence. The “Ẹ” prefix marks respect toward an elder or a group.', 'respectful', 'eh KOO oh-JOH MEH-ta (tone marks matter)', 2, '11111111-1111-4111-8111-111111111111', 'community', null, 0),
  ('bd0fedf5-66a9-348d-fa2a-38148efac472', '5ccbb1a6-0b51-b989-e0f2-22333f0e9ad0', 'ig', 'ig-standard', 'Ọ dịla anya', 'It has become far', 'It’s been a long time.', 'AI-suggested candidate. Awaiting native-speaker confirmation that this is the natural greeting in this situation — do not treat as reliable yet.', 'neutral', null, 3, '22222222-2222-4222-8222-222222222222', 'ai_suggestion', null, 0),
  ('ff8ba1c7-714d-f86d-5330-d9b4e3aeb010', 'c7215d73-7e92-2346-152f-0af87d15332b', 'en', 'en-standard', 'Good morning', null, 'Standard morning greeting.', null, 'neutral', null, 4, '11111111-1111-4111-8111-111111111111', 'verified', null, 0),
  ('7540183a-f31c-7125-35c2-a5ccefdf6449', 'c7215d73-7e92-2346-152f-0af87d15332b', 'ha', 'ha-standard', 'Ina kwana?', 'How was the sleep / the night?', 'Good morning.', 'The traditional morning greeting asks after the night. The usual reply is “Lafiya lau” — “in good health”.', 'neutral', null, 5, '11111111-1111-4111-8111-111111111111', 'verified', null, 0),
  ('c7dc0117-5ae4-0ce4-dc09-0e71637b9e6b', 'c7215d73-7e92-2346-152f-0af87d15332b', 'ha', 'ha-standard', 'Barka da safiya', 'Blessings on the morning', 'Good morning.', 'Slightly more formal than “Ina kwana?”; the “barka da …” pattern greets someone at a moment or occasion.', 'formal', null, 6, '11111111-1111-4111-8111-111111111111', 'verified', null, 0),
  ('1b7d665b-773a-b485-091f-3b55a5643c46', 'c7215d73-7e92-2346-152f-0af87d15332b', 'ig', 'ig-standard', 'Ị bọọla chi?', null, 'Good morning.', 'A traditional morning greeting asking whether the person came through the night well.', 'neutral', null, 7, '11111111-1111-4111-8111-111111111111', 'community', null, 0),
  ('c66d48f6-99cf-9146-0659-4341ebb40878', 'c7215d73-7e92-2346-152f-0af87d15332b', 'ig', 'ig-standard', 'Ụtụtụ ọma', 'Good morning (word for word)', 'Good morning.', 'Very widely used in modern speech and broadcasting.', 'neutral', null, 8, '11111111-1111-4111-8111-111111111111', 'disputed', 'Community discussion: some speakers regard this as a modern calque from English and prefer traditional greetings such as “Ị bọọla chi?”. Both usages are recorded; neither has been struck out.', 0),
  ('252a79d3-ebaf-9be4-9041-f58b09e9d2b0', 'c7215d73-7e92-2346-152f-0af87d15332b', 'yo', 'yo-standard', 'Ẹ káàárọ̀', 'Greetings on the morning (respectful)', 'Good morning.', 'Use toward elders, superiors, or a group — the “Ẹ” prefix carries the respect. Yorùbá greetings are strongly age-sensitive.', 'respectful', 'eh KAH-ah-raw', 9, '11111111-1111-4111-8111-111111111111', 'verified', null, 0),
  ('acf919b7-5771-d473-aa29-1352f2f123ff', 'c7215d73-7e92-2346-152f-0af87d15332b', 'yo', 'yo-standard', 'Káàárọ̀', 'Greetings on the morning', 'Good morning (to a peer or younger person).', 'The same greeting without the honorific “Ẹ”. Using this form with an elder would read as rude — pick the respectful record instead.', 'casual', null, 10, '11111111-1111-4111-8111-111111111111', 'verified', null, 0),
  ('c102dc97-952f-e2bd-cec4-5afeae72e3af', 'f75e8a1b-a57e-c8c8-dd2b-42507346efb6', 'en', 'en-standard', 'Welcome', null, 'Greeting to someone arriving.', 'Nigerian English uses “welcome” freely for any arrival — home from work, back from a trip — not only for guests.', 'neutral', null, 11, '11111111-1111-4111-8111-111111111111', 'verified', null, 0),
  ('cf81daa5-681e-4f69-76da-d825d22b85b9', 'f75e8a1b-a57e-c8c8-dd2b-42507346efb6', 'ha', 'ha-standard', 'Sannu da zuwa', 'Greetings on (your) coming', 'Welcome.', 'The “sannu da …” pattern greets someone in the middle of doing something — here, arriving.', 'neutral', null, 12, '11111111-1111-4111-8111-111111111111', 'verified', null, 0),
  ('3fb5117e-0d12-6dba-36e6-ceda8832f3bb', 'f75e8a1b-a57e-c8c8-dd2b-42507346efb6', 'ig', 'ig-standard', 'Nnọọ', null, 'Welcome.', 'The standard Igbo welcome. A faithful word-for-word gloss is awaiting native-speaker verification, so none is shown.', 'neutral', null, 13, '11111111-1111-4111-8111-111111111111', 'verified', null, 0),
  ('8cbef2f2-4b23-f333-9851-5c814a422408', 'f75e8a1b-a57e-c8c8-dd2b-42507346efb6', 'yo', 'yo-standard', 'Ẹ káàbọ̀', 'Greetings on your arrival', 'Welcome.', 'Respectful/plural form. Said to anyone arriving — a guest, or family returning home.', 'respectful', 'eh KAH-ah-baw', 14, '11111111-1111-4111-8111-111111111111', 'verified', null, 0),
  ('6da22838-89ce-fbca-6182-531c85fc7878', '3c909d45-cfac-4f6a-edc0-08657a04f8ce', 'en', 'en-standard', 'Thank you', null, 'Expression of gratitude.', null, 'neutral', null, 15, '11111111-1111-4111-8111-111111111111', 'verified', null, 0),
  ('f52e3be2-0782-550d-d2c2-2ea78a9cd4e3', '3c909d45-cfac-4f6a-edc0-08657a04f8ce', 'ha', 'ha-standard', 'Na gode', 'I am grateful', 'Thank you.', null, 'neutral', null, 16, '11111111-1111-4111-8111-111111111111', 'verified', null, 0),
  ('590f9bd4-a340-e81a-10e8-de9e1302e253', '3c909d45-cfac-4f6a-edc0-08657a04f8ce', 'ig', 'ig-standard', 'Daalụ', null, 'Thank you.', 'General-purpose thanks. A confident morpheme-level gloss is pending verification, so none is shown.', 'neutral', null, 17, '11111111-1111-4111-8111-111111111111', 'verified', null, 0),
  ('dff23700-3c26-5f2c-6efc-f5cfc4c96b10', '3c909d45-cfac-4f6a-edc0-08657a04f8ce', 'ig', 'ig-standard', 'Imela', 'You have done (well)', 'Thank you — appreciation for something done.', 'Thanks that points at a deed. Community-submitted; awaiting reviewer verification.', 'neutral', null, 18, '11111111-1111-4111-8111-111111111111', 'community', null, 0),
  ('90b618f7-6ec8-1fd9-5c29-73e2156e36cd', '3c909d45-cfac-4f6a-edc0-08657a04f8ce', 'yo', 'yo-standard', 'Ẹ ṣé', 'You (respectful) did (it)', 'Thank you (to an elder, superior, or group).', 'Gratitude framed as acknowledging what the person did. Never thank an elder with the casual form.', 'respectful', null, 19, '11111111-1111-4111-8111-111111111111', 'verified', null, 0),
  ('34013ce0-7f15-de3f-d852-3b666ff1b515', '3c909d45-cfac-4f6a-edc0-08657a04f8ce', 'yo', 'yo-standard', 'O ṣé', 'You did (it)', 'Thanks (to a peer or younger person).', null, 'casual', null, 20, '11111111-1111-4111-8111-111111111111', 'verified', null, 0),
  ('1b6d3aee-18da-c536-6ed3-2dfe8b161803', 'c96a45f9-707a-4525-dc3c-dafb9e789c4d', 'en', 'en-standard', 'Well done', null, 'Greeting to someone in the middle of work — solidarity, not appraisal.', 'In Nigerian English this is said to anyone working, as a greeting. It does not grade the work.', 'neutral', null, 21, '11111111-1111-4111-8111-111111111111', 'verified', null, 0),
  ('e2e58eeb-8212-64a2-8366-0f4776a97b02', 'c96a45f9-707a-4525-dc3c-dafb9e789c4d', 'ha', 'ha-standard', 'Sannu da aiki', 'Greetings on the work', 'Well done — greeting to someone working.', null, 'neutral', null, 22, '11111111-1111-4111-8111-111111111111', 'verified', null, 0),
  ('d9dd3b22-99b7-34c4-1488-dfd647f4e6d8', 'c96a45f9-707a-4525-dc3c-dafb9e789c4d', 'ig', 'ig-standard', 'Jisie ike', 'Hold firmly to strength', 'Well done / keep it up — encouragement to keep going.', 'Also used to close conversations and letters, wishing continued strength. Community-submitted; awaiting reviewer verification.', 'neutral', null, 23, '11111111-1111-4111-8111-111111111111', 'community', null, 0),
  ('8f29b0d0-eda0-8da3-6267-66c83ec5092d', 'c96a45f9-707a-4525-dc3c-dafb9e789c4d', 'yo', 'yo-standard', 'Ẹ kú iṣẹ́', 'Greetings on the work', 'Well done — greeting to someone working.', 'The same “kú …” greeting pattern as “Ẹ kú ọjọ́ mẹ́ta”, aimed at the situation the person is in.', 'respectful', null, 24, '11111111-1111-4111-8111-111111111111', 'verified', null, 0),
  ('be7256d5-48bb-b263-360d-419ab317a838', '6e7c985c-aada-469e-93ad-2582b8cd2f71', 'en', 'en-standard', 'Sorry', null, 'Sympathy for a misfortune, large or small.', 'In Nigerian English, “sorry” expresses sympathy even when the speaker had nothing to do with the mishap — closer to “what a pity” than an apology.', 'neutral', null, 25, '11111111-1111-4111-8111-111111111111', 'verified', null, 0),
  ('ea7fa27a-cf32-291a-213e-41fa18b651d7', '6e7c985c-aada-469e-93ad-2582b8cd2f71', 'ha', 'ha-standard', 'Sannu', null, 'Sorry — sympathy and gentle acknowledgement.', '“Sannu” is also the everyday hello; context and tone carry the sympathetic sense, often doubled: “sannu, sannu”.', 'neutral', null, 26, '11111111-1111-4111-8111-111111111111', 'verified', null, 0),
  ('19c2b57b-9582-ed11-64a4-9f0d5ae6b174', '6e7c985c-aada-469e-93ad-2582b8cd2f71', 'ig', 'ig-standard', 'Ndo', null, 'Sorry — sympathy for what happened.', 'Said for anything from a stubbed toe to serious loss.', 'neutral', null, 27, '11111111-1111-4111-8111-111111111111', 'verified', null, 0),
  ('0c10c794-1929-a4a2-be2f-f9a434b967ba', '6e7c985c-aada-469e-93ad-2582b8cd2f71', 'yo', 'yo-standard', 'Pẹ̀lẹ́', null, 'Sorry — gentle sympathy.', 'So characteristic that Nigerian English borrowed it wholesale: “pele o!”. Prefix “Ẹ” (Ẹ pẹ̀lẹ́) for respect toward elders.', 'neutral', 'PEH-leh (low–high tone)', 28, '11111111-1111-4111-8111-111111111111', 'verified', null, 0);

insert into examples (id, expression_id, text, translation, contributor_id, position) values
  ('473dab01-0359-bb77-dc33-c827b6afb893', '124a6861-0f75-82c8-83a0-8437decc0d51', 'Long time no see! Where have you been hiding?', 'Warm surprise at meeting someone after an absence.', '11111111-1111-4111-8111-111111111111', 0),
  ('38317108-4fd6-f84d-cfc4-a2c0bce0ef9b', '59e29322-711e-ad65-9eb4-8c7f72f26fdf', 'Kwana biyu! Ina labari?', 'Long time no see! What’s the news?', '11111111-1111-4111-8111-111111111111', 0),
  ('8dceda86-0ee0-249b-da17-b541c840fda8', '7540183a-f31c-7125-35c2-a5ccefdf6449', 'Ina kwana? — Lafiya lau.', 'Good morning. — Very well, thank you.', '11111111-1111-4111-8111-111111111111', 0),
  ('02c9bd49-d219-a07a-b145-387bf2f83147', '252a79d3-ebaf-9be4-9041-f58b09e9d2b0', 'Ẹ káàárọ̀ mà.', 'Good morning, ma.', '11111111-1111-4111-8111-111111111111', 0),
  ('1ff84eaf-1b15-c281-901e-808b6f787d4c', 'f52e3be2-0782-550d-d2c2-2ea78a9cd4e3', 'Na gode sosai.', 'Thank you very much.', '11111111-1111-4111-8111-111111111111', 0);

insert into expression_sources (expression_id, source_id) values
  ('124a6861-0f75-82c8-83a0-8437decc0d51', '8c7174e9-2cd0-f2e3-3198-64a03a57c1ad'),
  ('59e29322-711e-ad65-9eb4-8c7f72f26fdf', 'e14b5fd4-b6bd-b8d4-d760-1f8b3803085b'),
  ('c780e98c-316f-6af6-8f6d-35d2b2f2964e', '9eba7175-4095-0676-f839-746b8e32e856'),
  ('bd0fedf5-66a9-348d-fa2a-38148efac472', '9eba7175-4095-0676-f839-746b8e32e856'),
  ('ff8ba1c7-714d-f86d-5330-d9b4e3aeb010', 'f2a09295-ba6d-41d2-263c-007f9116371f'),
  ('7540183a-f31c-7125-35c2-a5ccefdf6449', 'e14b5fd4-b6bd-b8d4-d760-1f8b3803085b'),
  ('c7dc0117-5ae4-0ce4-dc09-0e71637b9e6b', 'e14b5fd4-b6bd-b8d4-d760-1f8b3803085b'),
  ('1b7d665b-773a-b485-091f-3b55a5643c46', '9eba7175-4095-0676-f839-746b8e32e856'),
  ('c66d48f6-99cf-9146-0659-4341ebb40878', 'f44fa9c5-c670-f1ec-a9b9-6b99c83c74c2'),
  ('252a79d3-ebaf-9be4-9041-f58b09e9d2b0', 'f3ccad2d-1007-8bc7-954b-538705264115'),
  ('acf919b7-5771-d473-aa29-1352f2f123ff', 'f3ccad2d-1007-8bc7-954b-538705264115'),
  ('c102dc97-952f-e2bd-cec4-5afeae72e3af', 'aa785a93-00b2-969a-dab7-c6baf99e3b38'),
  ('cf81daa5-681e-4f69-76da-d825d22b85b9', 'e14b5fd4-b6bd-b8d4-d760-1f8b3803085b'),
  ('3fb5117e-0d12-6dba-36e6-ceda8832f3bb', 'f44fa9c5-c670-f1ec-a9b9-6b99c83c74c2'),
  ('8cbef2f2-4b23-f333-9851-5c814a422408', 'f3ccad2d-1007-8bc7-954b-538705264115'),
  ('6da22838-89ce-fbca-6182-531c85fc7878', '7c182463-ad9f-f680-2162-ee4fbc18b9b9'),
  ('f52e3be2-0782-550d-d2c2-2ea78a9cd4e3', 'e14b5fd4-b6bd-b8d4-d760-1f8b3803085b'),
  ('590f9bd4-a340-e81a-10e8-de9e1302e253', 'f44fa9c5-c670-f1ec-a9b9-6b99c83c74c2'),
  ('dff23700-3c26-5f2c-6efc-f5cfc4c96b10', '9eba7175-4095-0676-f839-746b8e32e856'),
  ('90b618f7-6ec8-1fd9-5c29-73e2156e36cd', 'f3ccad2d-1007-8bc7-954b-538705264115'),
  ('34013ce0-7f15-de3f-d852-3b666ff1b515', 'f3ccad2d-1007-8bc7-954b-538705264115'),
  ('1b6d3aee-18da-c536-6ed3-2dfe8b161803', 'ddce2642-988d-7ef6-bc2a-e85a72a843e9'),
  ('e2e58eeb-8212-64a2-8366-0f4776a97b02', 'e14b5fd4-b6bd-b8d4-d760-1f8b3803085b'),
  ('d9dd3b22-99b7-34c4-1488-dfd647f4e6d8', '9eba7175-4095-0676-f839-746b8e32e856'),
  ('8f29b0d0-eda0-8da3-6267-66c83ec5092d', 'f3ccad2d-1007-8bc7-954b-538705264115'),
  ('be7256d5-48bb-b263-360d-419ab317a838', '8ee18924-d82f-8f75-2208-e7b7204a1110'),
  ('ea7fa27a-cf32-291a-213e-41fa18b651d7', 'e14b5fd4-b6bd-b8d4-d760-1f8b3803085b'),
  ('19c2b57b-9582-ed11-64a4-9f0d5ae6b174', 'f44fa9c5-c670-f1ec-a9b9-6b99c83c74c2'),
  ('0c10c794-1929-a4a2-be2f-f9a434b967ba', 'f3ccad2d-1007-8bc7-954b-538705264115');
