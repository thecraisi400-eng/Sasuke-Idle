import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.Pets
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.SportsKabaddi
import androidx.compose.material.icons.filled.Whatshot
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.math.roundToInt
import kotlin.random.Random

data class DamageParticle(
    val id: Long,
    val text: String,
    val color: Color,
    val startOffset: Offset
)

data class MenuEntry(
    val title: String,
    val color: Color,
    val icon: @Composable () -> Unit
)

class IdleGameViewModel : ViewModel() {
    var levelProgress by mutableFloatStateOf(0.75f)
        private set
    var rockHp by mutableFloatStateOf(1f)
        private set
    var minerHp by mutableFloatStateOf(0.92f)
        private set
    var gold by mutableLongStateOf(14_500)
        private set
    var dps by mutableIntStateOf(34_200)
        private set
    var selectedTint by mutableStateOf(Color(0xFF7B5E57))
        private set

    fun onRockClicked() {
        val clickDamage = 0.08f
        rockHp = (rockHp - clickDamage).coerceAtLeast(0f)
        gold += Random.nextLong(120, 250)
        if (rockHp <= 0f) {
            rockHp = 1f
            minerHp = (minerHp + 0.03f).coerceAtMost(1f)
            gold += 1_000
        }
    }

    fun applyDpsTick() {
        val tickDamage = 0.04f
        rockHp = (rockHp - tickDamage).coerceAtLeast(0f)
        gold += (dps / 20).toLong()
        if (rockHp <= 0f) {
            rockHp = 1f
            gold += 2_500
        }
    }

    fun onMenuPressed(color: Color) {
        selectedTint = color.copy(alpha = 0.35f)
    }
}

@Composable
fun IdleMiningGameScreen(vm: IdleGameViewModel = viewModel()) {
    val particles = remember { mutableStateListOf<DamageParticle>() }
    val shakeX = remember { Animatable(0f) }

    LaunchedEffect(Unit) {
        while (true) {
            delay(1000)
            vm.applyDpsTick()
        }
    }

    Surface(modifier = Modifier.fillMaxSize(), color = Color(0xFF1B1A1F)) {
        Column(modifier = Modifier.fillMaxSize()) {
            TopStatusBar(vm)
            CaveGameplayArea(
                vm = vm,
                particles = particles,
                shakeX = shakeX,
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(0.6f)
            )
            BottomMenu(
                onSelect = vm::onMenuPressed,
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(0.3f)
                    .padding(horizontal = 10.dp, vertical = 8.dp)
            )
        }
    }
}

@Composable
private fun TopStatusBar(vm: IdleGameViewModel) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text("Nivel 15", color = Color.White, style = MaterialTheme.typography.titleSmall)
            LinearProgressIndicator(
                progress = { vm.levelProgress },
                color = Color(0xFF2D9CFF),
                trackColor = Color(0xFF27405C),
                modifier = Modifier
                    .padding(top = 4.dp, end = 20.dp)
                    .fillMaxWidth()
                    .height(8.dp)
            )
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.Star, contentDescription = null, tint = Color(0xFFFFD166))
            Text(
                "14,5K",
                fontWeight = FontWeight.Bold,
                color = Color.White,
                modifier = Modifier.padding(start = 4.dp)
            )
        }
        Text(
            "34.2K DPS",
            color = Color.White,
            modifier = Modifier
                .background(Color(0xCC111111), RoundedCornerShape(20.dp))
                .padding(horizontal = 10.dp, vertical = 6.dp)
        )
    }
}

@Composable
private fun CaveGameplayArea(
    vm: IdleGameViewModel,
    particles: MutableList<DamageParticle>,
    shakeX: Animatable<Float, *>,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .background(Brush.verticalGradient(listOf(Color(0xFF3B2B20), Color(0xFF555555))))
    ) {
        TorchDecoration(Alignment.CenterStart, 12.dp)
        TorchDecoration(Alignment.CenterEnd, (-12).dp)

        Image(
            painter = painterResource(android.R.drawable.sym_def_app_icon),
            contentDescription = "Minero",
            modifier = Modifier
                .align(Alignment.BottomStart)
                .size(120.dp)
                .padding(12.dp),
            contentScale = ContentScale.Fit
        )

        Box(
            modifier = Modifier
                .align(Alignment.Center)
                .offset { IntOffset(shakeX.value.roundToInt(), 0) }
                .pointerInput(Unit) {
                    detectTapGestures {
                        vm.onRockClicked()
                        launch {
                            shakeX.snapTo(10f)
                            shakeX.animateTo(-10f, tween(45))
                            shakeX.animateTo(8f, tween(45))
                            shakeX.animateTo(0f, tween(55))
                        }
                        val amount = listOf("1755", "90K", "240", "12.4K").random()
                        val color = listOf(Color.Cyan, Color.Red, Color.Yellow).random()
                        particles += DamageParticle(
                            id = System.nanoTime(),
                            text = amount,
                            color = color,
                            startOffset = Offset(Random.nextFloat() * 50f - 25f, Random.nextFloat() * 20f)
                        )
                    }
                }
        ) {
            Image(
                painter = painterResource(android.R.drawable.btn_star_big_off),
                contentDescription = "Roca",
                modifier = Modifier.size(150.dp)
            )
            Column(
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .offset(y = (-42).dp)
                    .padding(horizontal = 20.dp)
            ) {
                LinearProgressIndicator(progress = { vm.rockHp }, color = Color.Red, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(4.dp))
                LinearProgressIndicator(progress = { vm.minerHp }, color = Color.Green, modifier = Modifier.fillMaxWidth())
            }
        }

        particles.forEach { particle ->
            FloatingDamageText(particle = particle, onFinish = { particles.remove(particle) })
        }

        Box(modifier = Modifier.matchParentSize().background(vm.selectedTint))
    }
}

@Composable
private fun FloatingDamageText(particle: DamageParticle, onFinish: () -> Unit) {
    val y = remember(particle.id) { Animatable(0f) }
    val alpha = remember(particle.id) { Animatable(1f) }

    LaunchedEffect(particle.id) {
        launch { y.animateTo(-120f, tween(durationMillis = 800, easing = FastOutSlowInEasing)) }
        launch { alpha.animateTo(0f, tween(durationMillis = 800)) }
        delay(810)
        onFinish()
    }

    Text(
        text = particle.text,
        color = particle.color,
        fontWeight = FontWeight.ExtraBold,
        modifier = Modifier
            .graphicsLayer(alpha = alpha.value)
            .offset {
                IntOffset(
                    x = (190 + particle.startOffset.x).roundToInt(),
                    y = (240 + particle.startOffset.y + y.value).roundToInt()
                )
            }
    )
}

@Composable
private fun TorchDecoration(alignment: Alignment, xOffset: Dp) {
    val scale = remember { Animatable(1f) }
    LaunchedEffect(Unit) {
        scale.animateTo(
            targetValue = 1.12f,
            animationSpec = infiniteRepeatable(
                animation = tween(380),
                repeatMode = RepeatMode.Reverse
            )
        )
    }
    Icon(
        imageVector = Icons.Default.Whatshot,
        contentDescription = "Antorcha",
        tint = Color(0xFFFF8C42),
        modifier = Modifier
            .align(alignment)
            .offset(x = xOffset)
            .scale(scale.value)
            .size(46.dp)
    )
}

@Composable
private fun BottomMenu(onSelect: (Color) -> Unit, modifier: Modifier = Modifier) {
    val entries = listOf(
        MenuEntry("Picos", Color.Blue) { Text("⛏️") },
        MenuEntry("Clanes", Color(0xFF4FC3F7)) { Icon(Icons.Default.Groups, null) },
        MenuEntry("Batalla", Color.Red) { Icon(Icons.Default.SportsKabaddi, null) },
        MenuEntry("Atributos", Color(0xFFFF9800)) { Text("⚔️") },
        MenuEntry("Arena", Color(0xFFDC143C)) { Text("🏟️") },
        MenuEntry("Eventos", Color(0xFF9C27B0)) { Text("🎉") },
        MenuEntry("Prestigio", Color(0xFF8D6E63)) { Text("👑") },
        MenuEntry("Mascotas", Color(0xFF4CAF50)) { Icon(Icons.Default.Pets, null) },
        MenuEntry("Ajustes", Color.Gray) { Icon(Icons.Default.Settings, null) }
    )

    LazyVerticalGrid(columns = GridCells.Fixed(3), modifier = modifier, verticalArrangement = Arrangement.spacedBy(8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        items(entries) { item ->
            val pressed = remember { Animatable(1f) }
            Card(
                colors = CardDefaults.cardColors(containerColor = item.color.copy(alpha = 0.20f)),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .aspectRatio(1f)
                    .scale(pressed.value)
                    .pointerInput(item.title) {
                        detectTapGestures(
                            onPress = {
                                pressed.animateTo(0.92f, tween(90))
                                tryAwaitRelease()
                                pressed.animateTo(1f, tween(90))
                                onSelect(item.color)
                            }
                        )
                    }
            ) {
                Column(
                    modifier = Modifier.fillMaxSize().padding(6.dp),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    item.icon()
                    Spacer(Modifier.height(6.dp))
                    Text(item.title, color = Color.White, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}
