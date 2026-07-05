-- Remove travessao/traco (— em-dash e – en-dash) de titulos de caso ja
-- gravados, trocando por " · " independente do espacamento ao redor.
UPDATE "Case"
SET "title" = regexp_replace("title", '\s*[—–]\s*', ' · ', 'g')
WHERE "title" ~ '[—–]';
