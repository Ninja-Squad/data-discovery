package fr.inra.urgi.rare;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;

/**
 * Unit test for {@link Application}
 * @author JB Nizet
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest
@TestPropertySource("/test.properties")
public class ApplicationTest {
    @Test
    public void shouldLoadContext() {}
}
