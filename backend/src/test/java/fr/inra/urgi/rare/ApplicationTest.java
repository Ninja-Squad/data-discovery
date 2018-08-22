package fr.inra.urgi.rare;

import fr.inra.urgi.rare.config.AppProfile;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;

/**
 * Unit test for {@link Application}
 * @author JB Nizet
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest
@TestPropertySource("/test.properties")
@ActiveProfiles(AppProfile.RARE)
public class ApplicationTest {
    @Test
    public void shouldLoadContext() {}
}
