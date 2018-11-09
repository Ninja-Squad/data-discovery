package fr.inra.urgi.datadiscovery;

import fr.inra.urgi.datadiscovery.config.AppProfile;
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
@TestPropertySource("/test-rare.properties")
@ActiveProfiles(AppProfile.RARE)
public class RareApplicationTest {
    @Test
    public void shouldLoadContext() {}
}
