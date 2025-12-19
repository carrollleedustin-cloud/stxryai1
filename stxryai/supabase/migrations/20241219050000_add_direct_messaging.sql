-- Location: supabase/migrations/20241219050000_add_direct_messaging.sql
-- Schema Analysis: Existing user_profiles, auth.users
-- Integration Type: New feature - Direct messaging and group chats
-- Dependencies: auth.users, user_profiles

-- ========================================
-- 1. CONVERSATIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Conversation type
    conversation_type TEXT NOT NULL CHECK (conversation_type IN ('direct', 'group')),
    conversation_name TEXT, -- For group chats
    
    -- Participants
    participants UUID[] NOT NULL DEFAULT '{}',
    
    -- Conversation metadata
    last_message_id UUID,
    last_message_at TIMESTAMPTZ,
    last_message_preview TEXT,
    
    -- Group chat specific
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    group_avatar_url TEXT,
    group_description TEXT,
    
    -- Status
    is_archived BOOLEAN DEFAULT FALSE NOT NULL,
    is_muted BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 2. MESSAGES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Message content
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' NOT NULL CHECK (message_type IN ('text', 'image', 'file', 'link', 'system')),
    
    -- Media/files
    media_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    file_type TEXT,
    
    -- Reply to another message
    reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    reply_preview TEXT,
    
    -- Status
    is_edited BOOLEAN DEFAULT FALSE NOT NULL,
    edited_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMPTZ,
    
    -- Read receipts
    read_by UUID[] DEFAULT '{}' NOT NULL,
    read_at TIMESTAMPTZ[] DEFAULT '{}' NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 3. CONVERSATION PARTICIPANTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Participant role (for group chats)
    role TEXT DEFAULT 'member' NOT NULL CHECK (role IN ('admin', 'moderator', 'member')),
    
    -- Notification preferences
    is_muted BOOLEAN DEFAULT FALSE NOT NULL,
    mute_until TIMESTAMPTZ,
    
    -- Read status
    last_read_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    last_read_at TIMESTAMPTZ,
    unread_count INTEGER DEFAULT 0 NOT NULL,
    
    -- Status
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    left_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(conversation_id, user_id)
);

-- ========================================
-- 4. TYPING INDICATORS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.typing_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    is_typing BOOLEAN DEFAULT TRUE NOT NULL,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(conversation_id, user_id)
);

-- ========================================
-- 5. MESSAGE REACTIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    reaction_type TEXT DEFAULT 'like' NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry', 'thumbs_up', 'thumbs_down')),
    emoji TEXT, -- Custom emoji support
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(message_id, user_id, reaction_type)
);

-- ========================================
-- 6. INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON public.conversations(conversation_type);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON public.messages(reply_to_id);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_unread ON public.conversation_participants(unread_count) WHERE unread_count > 0;

CREATE INDEX IF NOT EXISTS idx_typing_indicators_conversation ON public.typing_indicators(conversation_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_user ON public.typing_indicators(user_id);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user ON public.message_reactions(user_id);

-- ========================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Conversations Policies
CREATE POLICY "Users can view conversations they participate in"
    ON public.conversations FOR SELECT
    USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can create conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (auth.uid() = ANY(participants));

CREATE POLICY "Users can update conversations they participate in"
    ON public.conversations FOR UPDATE
    USING (auth.uid() = ANY(participants));

-- Messages Policies
CREATE POLICY "Users can view messages in their conversations"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE conversations.id = messages.conversation_id
            AND auth.uid() = ANY(conversations.participants)
        )
    );

CREATE POLICY "Users can create messages in their conversations"
    ON public.messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE conversations.id = messages.conversation_id
            AND auth.uid() = ANY(conversations.participants)
        )
    );

CREATE POLICY "Users can update their own messages"
    ON public.messages FOR UPDATE
    USING (auth.uid() = sender_id)
    WITH CHECK (auth.uid() = sender_id);

-- Conversation Participants Policies
CREATE POLICY "Users can view participants in their conversations"
    ON public.conversation_participants FOR SELECT
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE conversations.id = conversation_participants.conversation_id
            AND auth.uid() = ANY(conversations.participants)
        )
    );

CREATE POLICY "Users can manage their own participant records"
    ON public.conversation_participants FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Typing Indicators Policies
CREATE POLICY "Users can view typing indicators in their conversations"
    ON public.typing_indicators FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE conversations.id = typing_indicators.conversation_id
            AND auth.uid() = ANY(conversations.participants)
        )
    );

CREATE POLICY "Users can manage their own typing indicators"
    ON public.typing_indicators FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Message Reactions Policies
CREATE POLICY "Users can view reactions in their conversations"
    ON public.message_reactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.messages
            JOIN public.conversations ON conversations.id = messages.conversation_id
            WHERE messages.id = message_reactions.message_id
            AND auth.uid() = ANY(conversations.participants)
        )
    );

CREATE POLICY "Users can manage their own reactions"
    ON public.message_reactions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 8. FUNCTIONS AND TRIGGERS
-- ========================================

-- Triggers for updated_at
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversation_participants_updated_at
    BEFORE UPDATE ON public.conversation_participants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update conversation last message
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET 
        last_message_id = NEW.id,
        last_message_at = NEW.created_at,
        last_message_preview = LEFT(NEW.content, 100),
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_last_message_trigger
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_conversation_last_message();

-- Function to increment unread count
CREATE OR REPLACE FUNCTION public.increment_unread_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment unread count for all participants except sender
    UPDATE public.conversation_participants
    SET unread_count = unread_count + 1
    WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id
    AND is_active = TRUE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_unread_count_trigger
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.increment_unread_count();

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_messages_read(
    p_conversation_id UUID,
    p_user_id UUID,
    p_message_id UUID
)
RETURNS VOID AS $$
BEGIN
    -- Update read_by array for messages
    UPDATE public.messages
    SET 
        read_by = array_append(read_by, p_user_id),
        read_at = array_append(read_at, NOW())
    WHERE conversation_id = p_conversation_id
    AND id <= p_message_id
    AND NOT (p_user_id = ANY(read_by));
    
    -- Update participant's last read
    UPDATE public.conversation_participants
    SET 
        last_read_message_id = p_message_id,
        last_read_at = NOW(),
        unread_count = 0
    WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create or get direct conversation
CREATE OR REPLACE FUNCTION public.get_or_create_direct_conversation(
    p_user1_id UUID,
    p_user2_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_conversation_id UUID;
BEGIN
    -- Try to find existing conversation
    SELECT id INTO v_conversation_id
    FROM public.conversations
    WHERE conversation_type = 'direct'
    AND participants @> ARRAY[p_user1_id]
    AND participants @> ARRAY[p_user2_id]
    AND array_length(participants, 1) = 2
    LIMIT 1;
    
    -- Create if doesn't exist
    IF v_conversation_id IS NULL THEN
        INSERT INTO public.conversations (
            conversation_type,
            participants
        ) VALUES (
            'direct',
            ARRAY[p_user1_id, p_user2_id]
        )
        RETURNING id INTO v_conversation_id;
        
        -- Create participant records
        INSERT INTO public.conversation_participants (conversation_id, user_id)
        VALUES (v_conversation_id, p_user1_id), (v_conversation_id, p_user2_id);
    END IF;
    
    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 9. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.conversations IS 'Direct messages and group chat conversations';
COMMENT ON TABLE public.messages IS 'Individual messages in conversations';
COMMENT ON TABLE public.conversation_participants IS 'Participants in conversations with read status';
COMMENT ON TABLE public.typing_indicators IS 'Real-time typing indicators for conversations';
COMMENT ON TABLE public.message_reactions IS 'Reactions (emojis) on messages';

COMMENT ON COLUMN public.conversations.participants IS 'Array of user IDs participating in the conversation';
COMMENT ON COLUMN public.messages.read_by IS 'Array of user IDs who have read this message';
COMMENT ON COLUMN public.conversation_participants.unread_count IS 'Number of unread messages for this participant';

