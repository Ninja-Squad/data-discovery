package fr.inra.urgi.rare.harvest;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.ByteArrayInputStream;
import java.util.stream.Stream;

import fr.inra.urgi.rare.dao.HarvestResultDao;
import fr.inra.urgi.rare.harvest.HarvestResult.HarvestResultBuilder;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit tests for {@link AsyncHarvester}
 * @author JB Nizet
 */
@ExtendWith(MockitoExtension.class)
class AsyncHarvesterTest {

    @Mock
    private AbstractHarvester mockHarvester;

    @Mock
    private HarvestResultDao mockHarvestResultDao;

    @InjectMocks
    private AsyncHarvester asyncHarvester;

    @Test
    public void shouldHarvest() {
        HarvestResultBuilder resultBuilder = HarvestResult.builder();

        HarvestedStream harvestedStream1 = new HarvestedStream("file1.json", new ByteArrayInputStream(new byte[0]));
        HarvestedStream harvestedStream2 = new HarvestedStream("file2.json", new ByteArrayInputStream(new byte[0]));
        when(mockHarvester.jsonFiles(resultBuilder)).thenReturn(Stream.of(harvestedStream1, harvestedStream2));

        asyncHarvester.harvest(resultBuilder);

        verify(mockHarvester).harvest(harvestedStream1, resultBuilder);
        verify(mockHarvester).harvest(harvestedStream2, resultBuilder);
        verify(mockHarvestResultDao, times(3)).save(any());
        verify(mockHarvestResultDao).save(argThat(r -> r.getEndInstant() != null));
    }
}
