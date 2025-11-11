UPDATE passes 
SET user_id = 'a2a56306bd7d81ba2d14685f91c689cc'
WHERE user_id IS NULL;

SELECT COUNT(*) FROM passes WHERE user_id IS NULL;
