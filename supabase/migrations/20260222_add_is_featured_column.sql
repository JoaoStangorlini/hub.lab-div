-- Adiciona a coluna is_featured para destacar conteúdos no carrossel
-- Caso a coluna 'featured' já exista, ela será renomeada (mantendo dados se houver)
-- Se não existir, cria 'is_featured' do zero.

DO $$ 
BEGIN
    -- Se existir 'featured' mas não 'is_featured', renomeia
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='featured') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='is_featured') THEN
        ALTER TABLE submissions RENAME COLUMN featured TO is_featured;
    -- Se não existir nenhuma das duas, cria 'is_featured'
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='is_featured') THEN
        ALTER TABLE submissions ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
END $$;
