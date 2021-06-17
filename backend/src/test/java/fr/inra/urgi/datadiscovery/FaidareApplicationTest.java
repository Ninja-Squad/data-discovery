package fr.inra.urgi.datadiscovery;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

/**
 * Unit test for {@link Application}
 * @author JB Nizet
 */
@SpringBootTest
@TestPropertySource("/test-faidare.properties")
@ActiveProfiles(AppProfile.FAIDARE)
public class FaidareApplicationTest {
    @Test
    public void shouldLoadContext() {}
}
